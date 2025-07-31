# QA Instructions
These instructions are meant to be done by a real QA tester or something like Playwright/Cypress in the future.

## User Walkthroughs

### Areas
- /translate
- /story
- /home
- /dashboard

### Instructions
- Ensure that every walkthrough goes from step 1 to end correctly
- Ensure end button displays "finish"
- Ensure that back button works
- Ensure that skip will skip the tour for that page
- Ensure that the element focused is highlighted
- Ensure that the walkthrough arrow points to the highlighted element

### Responsive
- Ensure all steps work on responsive devices
- Ensure that when the user scrolls the modal adjust with the user
- Ensure that the modal reduces size elegantly on small devices
- Ensure that the highlighted element stays highlighted even though the user scrolls

## Validation/Sanitization

Verify that malicious text is stripped from the following areas on both the FE and BE.

### Malicious Input
TODO: Get a master list of only allowed tags
TODO: Finalize the test cases for malicious input

### Areas To Test
- User sign in
- User sign up
- User profile edit
- Save translated story
- Translate story
