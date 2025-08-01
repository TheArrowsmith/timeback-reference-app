## Uploading data

1. Login and get an access token.
2. Store it in an env var called `JWT_TOKEN`
3. run `./data/qti/upload_quiz.sh` - this will upload a quiz with two questions. Make a note of its ID.
4. run `./data/oneroster/create_data.sh` - this will upload some OneRoster data about a school with classes, courses etc..

Note that the above two scripts assume that you're running the API locally on `localhost:8080`. You can override this by setting a `DOMAIN` env var.

## Viewing the reference app.

1. `cd timeback-reference`
2. Open `/src/lib/config.ts` and update `JWT_TOKEN` with your token.
3. Run `npm install` and start the server with `npm run dev`
4. Visit `http://localhost:3000/assessment/<quiz-id>` with the quiz ID you noted above. You’ll see the quiz rendered.
5. Visit `http://localhost:3000/oneroster` to see the oneroster data.

## KNOWN ISSUES

- We need to add some actual auth instead of hardcoding the JWT
- The quiz question data retrieved from the API doesn’t include the actual answers to the multiple choice question. I’m not sure if that’s because the script didn’t upload it in the first place or if it’s being stored but not retrieved - haven’t had time to check. If you look in the code you’ll see that Claude “fixed” this by hardcoding the missing XML directly into the `qti-client` module. This at least means we can see what the UI will look like. I’ll figure out how to actually retrieve the data tomorrow.
