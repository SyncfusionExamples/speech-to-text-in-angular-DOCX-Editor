# Speech-to-Text Integration in Angular DOCX Editor

## Introduction

This sample demonstrates how to integrate speech recognition with the Syncfusion® Angular Document Editor. It showcases how spoken input can be converted into text using the Syncfusion® Speech-to-Text component and inserted directly into the document through the Document Editor APIs.

The sample serves as a reference for integrating external voice recognition solutions with the Document Editor.

## Features

### 1. Speech-to-Text Conversion

Convert spoken input into text using the Syncfusion Speech-to-Text component and view the transcribed content in real time.

### 2. Insert Dictated Content

Insert the recognized text directly into the document at the current cursor position using the Document Editor's `insertText` API.

### 3. Continuous Document Editing

Continue editing, formatting, and managing the document after the dictated content is inserted, leveraging the full capabilities of the Document Editor.

### 4. Extensible Integration Model

The sample demonstrates an integration pattern that can also be used with third-party voice recognition or dictation solutions. Generated content can be inserted into the Document Editor as:

- Plain text using the `insertText` API
- Formatted HTML content using the `paste` API

## Prerequisites

Install the following before running the sample:

- Node.js (LTS version recommended)
- Angular CLI
- A valid Syncfusion license key
- Modern web browser (Chrome, Edge, Firefox, or Safari)

## How to Run the Sample

1. Open a terminal in the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the application:

   ```bash
   ng serve
   ```

4. Open your browser and navigate to:

   ```
   http://localhost:4200
   ```

## Demo

### What the Demo Shows

- Convert speech into text using the Syncfusion Speech-to-Text component
- Insert recognized text into the Document Editor
- Edit and format the inserted content within the document
- Demonstrate a foundation for integrating external voice recognition solutions

## Resources

- **Product Page**: [Syncfusion® Angular Document Editor](https://www.syncfusion.com/docx-editor-sdk/angular-docx-editor)
- **Documentation**: [Angular Document Editor Documentation](https://help.syncfusion.com/document-processing/word/word-processor/angular/getting-started)
- **Online Demo**: [Syncfusion Document Editor Demo](https://document.syncfusion.com/demos/docx-editor/angular/#/tailwind3/document-editor/default)

## Support and Feedback

For any other queries, reach our [Syncfusion® support team](https://support.syncfusion.com) or post the queries through the [community forums](https://www.syncfusion.com/forums).

Request new feature through [Syncfusion® feedback portal](https://www.syncfusion.com/feedback).

## License

This is a commercial product and requires a paid license for possession or use. Syncfusion's licensed software, including this component, is subject to the terms and conditions of [Syncfusion's EULA](https://www.syncfusion.com/license/studio/syncfusion_essential_studio_eula.pdf).

- **Purchase a License**: [Syncfusion Licensing](https://www.syncfusion.com/sales/products)
- **Start Free Trial**: [30-Day Free Trial](https://www.syncfusion.com/account/manage-trials/start-trials)

