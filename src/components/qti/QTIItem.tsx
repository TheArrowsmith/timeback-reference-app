'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface QTIItemProps {
  id: string;
  identifier: string;
  title: string;
  xmlContent: string;
  interactionType: string;
  index: number;
}

export function QTIItem({ id, identifier, title, xmlContent, interactionType, index }: QTIItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    async function renderItem() {
      if (!xmlContent || !containerRef.current) return;

      try {
        // First, let's display the raw XML to see what we're working with
        if (!xmlContent || !xmlContent.trim()) {
          // No XML content available - show a placeholder
          containerRef.current.innerHTML = `
            <div style="padding: 1rem; background-color: #fef3c7; border-radius: 0.5rem;">
              <p style="color: #92400e; font-weight: 500;">No XML content available for this item</p>
              <p style="color: #92400e; font-size: 0.875rem; margin-top: 0.5rem;">The item exists but doesn't have associated XML content yet.</p>
            </div>
          `;
          return;
        }

        console.log('Processing item:', identifier, 'Type:', interactionType);
        console.log('Raw XML length:', xmlContent.length);
        console.log('First 200 chars of XML:', xmlContent.substring(0, 200));

        // For now, we'll parse and display the XML content in a basic way
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          // If parsing failed, show the raw XML
          containerRef.current.innerHTML = `
            <div style="padding: 1rem; background-color: #fee; border-radius: 0.5rem;">
              <p style="color: #c00; font-weight: bold;">XML Parsing Error</p>
              <pre style="white-space: pre-wrap; font-size: 0.75rem; overflow-x: auto;">${xmlContent.substring(0, 500)}...</pre>
            </div>
          `;
          return;
        }

        // Log the root element to understand the structure
        console.log('XML root element:', xmlDoc.documentElement.tagName);
        console.log('XML namespaces:', xmlDoc.documentElement.namespaceURI);

        // Try different ways to extract the question text
        let questionText = '';
        const itemBody = xmlDoc.getElementsByTagName('itemBody')[0] || 
                        xmlDoc.getElementsByTagNameNS('*', 'itemBody')[0];
        
        if (itemBody) {
          const p = itemBody.getElementsByTagName('p')[0];
          const div = itemBody.getElementsByTagName('div')[0];
          questionText = p?.textContent || div?.textContent || 'Question content not found';
        } else {
          questionText = 'Could not find itemBody element';
        }

        // Create basic HTML representation
        let contentHtml = `<div style="display: flex; flex-direction: column; gap: 1rem;">`;
        contentHtml += `<p style="font-size: 1rem;">${questionText}</p>`;

        if (interactionType === 'choice') {
          // Try multiple ways to find choice elements
          console.log('Looking for choiceInteraction elements...');
          
          // Try different namespace approaches - QTI can use v2p1 or v2p2
          const choiceInteraction = xmlDoc.getElementsByTagName('choiceInteraction')[0] || 
                                   xmlDoc.getElementsByTagNameNS('*', 'choiceInteraction')[0] ||
                                   xmlDoc.getElementsByTagNameNS('http://www.imsglobal.org/xsd/imsqti_v2p1', 'choiceInteraction')[0] ||
                                   xmlDoc.getElementsByTagNameNS('http://www.imsglobal.org/xsd/imsqti_v2p2', 'choiceInteraction')[0];
          
          console.log('Found choiceInteraction:', choiceInteraction);
          
          if (choiceInteraction) {
            // Try different ways to get choices
            let choices = choiceInteraction.getElementsByTagName('simpleChoice');
            if (choices.length === 0) {
              choices = choiceInteraction.getElementsByTagNameNS('*', 'simpleChoice');
            }
            if (choices.length === 0) {
              choices = choiceInteraction.getElementsByTagNameNS('http://www.imsglobal.org/xsd/imsqti_v2p1', 'simpleChoice');
            }
            if (choices.length === 0) {
              choices = choiceInteraction.getElementsByTagNameNS('http://www.imsglobal.org/xsd/imsqti_v2p2', 'simpleChoice');
            }
            
            console.log('Found', choices.length, 'choices');
            
            if (choices.length > 0) {
              contentHtml += '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
              for (let i = 0; i < choices.length; i++) {
                const choice = choices[i];
                const choiceId = choice.getAttribute('identifier') || `choice_${i}`;
                const choiceText = choice.textContent || '';
                console.log(`Choice ${i}: ID=${choiceId}, Text=${choiceText}`);
                contentHtml += `
                  <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 0.5rem; cursor: pointer;">
                    <input type="radio" name="question_${id}" value="${choiceId}" style="width: 1rem; height: 1rem;" />
                    <span>${choiceText}</span>
                  </label>
                `;
              }
              contentHtml += '</div>';
            } else {
              // Show debug info if no choices found
              console.log('No simpleChoice elements found, showing choiceInteraction innerHTML:', choiceInteraction.innerHTML);
              contentHtml += `
                <div style="padding: 0.5rem; background-color: #fef3c7; border-radius: 0.25rem;">
                  <p style="font-size: 0.875rem; color: #92400e;">No choices found in choiceInteraction element</p>
                  <pre style="font-size: 0.75rem; overflow-x: auto; max-height: 200px;">${choiceInteraction.innerHTML}</pre>
                </div>
              `;
            }
          } else {
            // If we can't find the choiceInteraction, show the XML structure
            console.log('No choiceInteraction found. All element names:', Array.from(xmlDoc.getElementsByTagName('*')).map(el => el.tagName).slice(0, 20));
            contentHtml += `
              <div style="padding: 0.5rem; background-color: #fef3c7; border-radius: 0.25rem;">
                <p style="font-size: 0.875rem; color: #92400e;">Could not find choiceInteraction element. XML structure:</p>
                <pre style="font-size: 0.75rem; overflow-x: auto; max-height: 200px;">${xmlDoc.documentElement.outerHTML.substring(0, 500)}...</pre>
              </div>
            `;
          }
        } else if (interactionType === 'textEntry') {
          // Add text input for text entry questions
          contentHtml += `
            <div>
              <input 
                type="text" 
                style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 0.5rem; outline: none;" 
                placeholder="Enter your answer here..."
              />
            </div>
          `;
        }

        contentHtml += '</div>';

        // Set the content
        if (containerRef.current) {
          containerRef.current.innerHTML = contentHtml;
        }

      } catch (error) {
        console.error('Error rendering QTI item:', error);
        setRenderError(error instanceof Error ? error.message : 'Failed to render item');
      }
    }

    renderItem();
  }, [xmlContent, id, interactionType]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            Question {index + 1}: {title}
          </h3>
          <p className="text-sm mt-1" style={{color: 'hsl(var(--muted-foreground))'}}>
            Type: {interactionType}
          </p>
        </div>
        
        {renderError ? (
          <div className="text-red-600 p-4 bg-red-50 rounded">
            Error: {renderError}
          </div>
        ) : (
          <div ref={containerRef} className="qti-item-content">
            <div className="animate-pulse">
              <div style={{height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '75%', marginBottom: '1rem'}}></div>
              <div style={{height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '50%'}}></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}