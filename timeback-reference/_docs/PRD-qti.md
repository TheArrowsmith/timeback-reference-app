The current repo is a fresh Next.js app generated with `create-next-app` using Tailwind, Typescript and ESLint.

Create a page that loads the QTI `assessmentTest` with a given ID from the API (localhost:8080) and renders it. (I'll provide the ID later, just user a placeholder ID for now.

Tailwind and ShadCN for the UI.

You'll need to retrieve the full XML documents following the guidelines in `@_docs/QTI-API-ref.md` then render them using the package `@ot-sa/tao-item-runner-qti`.

The `assessmentTest` represents a quiz with two questions. The first is a multiple choice question with two answers. The second is a question with a freeform text input. The quiz doesn't need to be "interactive" yet, we don't need the ability to submit it. We just need to load and render it.

Before you begin the implementation, do you have any questions?
