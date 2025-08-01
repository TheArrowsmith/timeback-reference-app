import { API_CONFIG } from '@/lib/config';
import { getAuthToken } from '@/lib/auth/sso';

interface TestPart {
  id: string;
  identifier: string;
  sections: Section[];
}

interface Section {
  id: string;
  identifier: string;
  title: string;
  items: Item[];
}

interface Item {
  id: string;
  identifier: string;
  title: string;
  interactionType: string;
  sequence: number;
  xmlContent?: string;
}

interface ItemDetails {
  item: {
    id: string;
    identifier: string;
    title: string;
    xmlUrl: string;
    xmlHash: string;
  };
}

interface TestPartsResponse {
  testParts: TestPart[];
}

export async function fetchTestHierarchy(testId: string): Promise<TestPartsResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.QTI_BASE_PATH}/assessment-tests/${testId}/test-parts`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch test hierarchy: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchItemDetails(itemId: string): Promise<ItemDetails> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  console.log('Fetching item details for:', itemId);
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.QTI_BASE_PATH}/assessment-items/${itemId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch item details: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Item details response:', JSON.stringify(data, null, 2));
  return data;
}

export async function fetchItemXML(xmlUrl: string): Promise<string> {
  console.log('Fetching XML from URL:', xmlUrl);
  
  // The xmlUrl should be a pre-signed S3 URL that doesn't require authentication
  const response = await fetch(xmlUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/xml, text/xml',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch XML. Status:', response.status);
    console.error('Response headers:', response.headers);
    throw new Error(`Failed to fetch item XML: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  console.log('Response content-type:', contentType);

  const xmlContent = await response.text();
  console.log('Fetched content length:', xmlContent.length);
  console.log('Content preview:', xmlContent.substring(0, 500));
  
  // Check if we received HTML instead of XML
  if (xmlContent.includes('<!DOCTYPE html') || xmlContent.includes('<html')) {
    console.error('ERROR: Received HTML instead of XML. This might be a CORS issue or incorrect URL.');
    console.error('Full URL was:', xmlUrl);
  }
  
  return xmlContent;
}

export async function loadCompleteAssessmentTest(testId: string): Promise<TestPartsResponse> {
  try {
    // Step 1: Fetch test hierarchy
    const testData = await fetchTestHierarchy(testId);

    // Step 2 & 3: Fetch item details and XML for each item
    for (const part of testData.testParts) {
      for (const section of part.sections) {
        const itemPromises = section.items.map(async (item) => {
          try {
            // Step 2: Get item details including XML URL
            const itemDetails = await fetchItemDetails(item.id);
            
            // Check if xmlUrl exists
            const xmlUrl = itemDetails.item.xmlUrl;
            if (!xmlUrl) {
              console.warn(`No XML URL provided for item ${item.id}. Using mock XML for testing.`);
              
              // Use mock XML based on interaction type for testing
              let mockXml = '';
              if (item.interactionType === 'choice') {
                mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                identifier="${item.identifier}" 
                title="${item.title}">
  <itemBody>
    <div>
      <p>What city is Gauntlet AI based in?</p>
      <choiceInteraction responseIdentifier="RESPONSE" shuffle="false" maxChoices="1">
        <simpleChoice identifier="choice_austin">Austin, Texas</simpleChoice>
        <simpleChoice identifier="choice_paris">Paris, France</simpleChoice>
        <simpleChoice identifier="choice_london">London, UK</simpleChoice>
        <simpleChoice identifier="choice_tokyo">Tokyo, Japan</simpleChoice>
      </choiceInteraction>
    </div>
  </itemBody>
</assessmentItem>`;
              } else if (item.interactionType === 'textEntry') {
                mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                identifier="${item.identifier}"
                title="${item.title}">
  <itemBody>
    <div>
      <p>What is Austen's last name?</p>
      <textEntryInteraction responseIdentifier="RESPONSE" expectedLength="20"/>
    </div>
  </itemBody>
</assessmentItem>`;
              }
              
              return { ...item, xmlContent: mockXml };
            }
            
            // Check if xmlUrl looks like an S3 URL
            if (!xmlUrl.includes('s3.amazonaws.com') && !xmlUrl.includes('s3://')) {
              console.warn('XML URL does not appear to be an S3 URL:', xmlUrl);
            }
            
            // Step 3: Fetch the XML content
            const xmlContent = await fetchItemXML(xmlUrl);
            
            // Add XML content to the item
            return { ...item, xmlContent };
          } catch (error) {
            console.error(`Failed to load item ${item.id}:`, error);
            return { ...item, xmlContent: '' };
          }
        });

        // Wait for all items in the section to load
        section.items = await Promise.all(itemPromises);
      }
    }

    return testData;
  } catch (error) {
    console.error('Failed to load assessment test:', error);
    throw error;
  }
}
