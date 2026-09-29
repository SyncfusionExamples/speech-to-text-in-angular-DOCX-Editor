import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToolbarService, DocumentEditorContainerComponent, RibbonService, DocumentEditorContainerModule } from '@syncfusion/ej2-angular-documenteditor';
import { TitleBar } from './title-bar';
import { DictationBar } from './dictation-bar';
import { defaultDocument, WEB_API_ACTION } from './data';
import { isNullOrUndefined } from '@syncfusion/ej2-base';


import { SwitchComponent, SwitchModule } from '@syncfusion/ej2-angular-buttons';

/**
 * Document Editor Component with Medical Dictation (Speech-to-Text) support.
 * The dictation bar is a self-contained class (see ./dictation-bar.ts) so it
 * can be reused in any sample with a Document Editor.
 */
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    encapsulation: ViewEncapsulation.None,
    providers: [ToolbarService, RibbonService],
    standalone: true,
    imports: [DocumentEditorContainerModule, SwitchModule]
})
export class AppComponent {
    public hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    @ViewChild('documenteditor_default')
    public container: DocumentEditorContainerComponent;
    public culture: string = 'en-US';
    titleBar: TitleBar;
    /** Reusable speech-to-text bar. */
    dictationBar: DictationBar;

    onCreate(): void {
        let titleBarElement: HTMLElement = document.getElementById('default_title_bar');
        this.titleBar = new TitleBar(titleBarElement, this.container.documentEditor, true);
        this.container.documentEditor.open(JSON.stringify(defaultDocument));
        this.container.documentEditor.documentName = 'Patient Note';
        this.titleBar.updateDocumentTitle();
        this.titleBar.showButtons(false);

        // Wire the speech-to-text bar on the right side of the editor (NOT in the ribbon/toolbar).
        const dictationHost: HTMLElement = document.getElementById('speech_to_text_bar') as HTMLElement;
        if (dictationHost) {
            this.dictationBar = new DictationBar(dictationHost, this.container.documentEditor);
        }
    }

    onDocumentChange(): void {
        if (!isNullOrUndefined(this.titleBar)) {
            this.titleBar.updateDocumentTitle();
        }
        this.container.documentEditor.focusIn();
    }
}