import { createElement } from '@syncfusion/ej2-base';
import { DocumentEditor } from '@syncfusion/ej2-documenteditor';
import {
  SpeechToText,
  StartListeningEventArgs,
  StopListeningEventArgs,
  ErrorEventArgs,
  TranscriptChangedEventArgs
} from '@syncfusion/ej2-inputs';

/**
 * Reusable Speech-to-Text (medical dictation) bar for the Syncfusion Document Editor.
 *
 * Mirrors the `TitleBar` pattern: pass it a host `HTMLElement` plus the
 * `DocumentEditor` instance, and it builds and wires everything itself.
 *
 * Example:
 *   const dictationBar = new DictationBar(
 *     document.getElementById('medical_dictation_bar'),
 *     container.documentEditor
 *   );
 *
 * Features:
 *  - One-click mic to start/stop dictation
 *  - Inserts the final transcript at the current cursor on stop
 *  - Properly restores focus to the Document Editor before inserting
 *    (otherwise the mic button still has focus after click and insertText is a no-op)
 *  - Live status text
 *  - Language picker (en-US, en-GB, es-ES, fr-FR, de-DE, hi-IN)
 *  - Disabled state if the browser does not support Web Speech API
 *  - Public methods: `setLanguage(lang)`, `destroy()`
 */
export class DictationBar {
  private host: HTMLElement;
  private documentEditor: DocumentEditor;
  private speechToText!: SpeechToText;

  private statusEl?: HTMLElement;
  private micButtonHost?: HTMLElement;
  private langSelect?: HTMLSelectElement;
  private listeningClass = 'e-dictation-bar--listening';
  private disabledClass = 'e-dictation-bar--disabled';

  /** BCP-47 locale used for recognition. */
  private language: string = 'en-US';

  constructor(host: HTMLElement, documentEditor: DocumentEditor) {
    if (!host) {
      throw new Error('DictationBar: host element is required.');
    }
    if (!documentEditor) {
      throw new Error('DictationBar: a DocumentEditor instance is required.');
    }
    this.host = host;
    this.documentEditor = documentEditor;
    this.initialize();
    this.wireEvents();
  }

  /** Builds the full dictation bar UI inside `this.host`. */
  private initialize(): void {
    this.host.classList.add('e-dictation-bar');
    this.host.setAttribute('role', 'region');
    this.host.setAttribute('aria-label', 'Speech to text');
    this.host.setAttribute('style','align-items:center');

    // Header
    const header = createElement('div', { className: 'e-dictation-bar__header' });
    const title = createElement('span', {
      className: 'e-dictation-bar__title',
      attrs: { 'aria-hidden': 'true' },
    });
    const headerIcon = createElement('span', { className: 'e-dictation-bar__icon' });
    title.appendChild(headerIcon);
    title.appendChild(document.createTextNode(' Speech to text'));
    header.appendChild(title);
    this.host.appendChild(header);

    // Mic button host — SpeechToText renders its <button> here.
    this.micButtonHost = createElement('div', { className: 'e-dictation-bar__mic' });
    this.host.appendChild(this.micButtonHost);

    // Status text
    this.statusEl = createElement('span', {
      className: 'e-dictation-bar__status',
    });
    this.statusEl.textContent = 'Click the mic to start dictating...';
    this.host.appendChild(this.statusEl);

    // Divider
    this.host.appendChild(createElement('div', { className: 'e-dictation-bar__divider' }));

    // Language picker
    const langLabel = createElement('label', {
      className: 'e-dictation-bar__lang-label',
      attrs: { for: 'e-dictation-bar-lang' },
    });
    langLabel.textContent = 'Language';
    this.host.appendChild(langLabel);

    this.langSelect = createElement('select', {
      className: 'e-dictation-bar__lang',
      id: 'e-dictation-bar-lang',
    }) as HTMLSelectElement;
    this.langSelect.setAttribute('aria-label', 'Dictation language');
    const languages: Array<{ value: string; label: string }> = [
      { value: 'en-US', label: 'English (US)' },
      { value: 'en-GB', label: 'English (UK)' },
      { value: 'es-ES', label: 'Spanish (ES)' },
      { value: 'fr-FR', label: 'French (FR)' },
      { value: 'de-DE', label: 'German (DE)' },
      { value: 'hi-IN', label: 'Hindi (IN)' },
    ];
    languages.forEach((l) => {
      const opt = createElement('option', { attrs: { value: l.value } }) as HTMLOptionElement;
      opt.textContent = l.label;
      if (l.value === this.language) {
        opt.selected = true;
      }
      this.langSelect!.appendChild(opt);
    });
    this.host.appendChild(this.langSelect);

    // Create the Syncfusion SpeechToText inside the mic host.
    this.speechToText = new SpeechToText({
      lang: this.language,
      buttonSettings: {
        iconCss: 'e-icons e-listen-icon',
        stopIconCss: 'e-icons e-listen-stop',
      },
      cssClass: 'e-dictation-bar__mic-btn',
      showTooltip: true,
    });
    this.speechToText.appendTo(this.micButtonHost);

    // Prevent the mic button from stealing focus from the Document Editor.
    // Without this, clicking the mic moves focus to the button and the
    // editor's `insertText()` silently no-ops on stop.
    this.preventMicFocusSteal();
  }

  /**
   * Hooks the mic button's `mousedown` to prevent the default focus shift.
   * The click event still fires (so the SpeechToText widget toggles
   * listening), but the Document Editor keeps its caret and focus.
   */
  private preventMicFocusSteal(): void {
    if (!this.micButtonHost) {
      return;
    }
    // Use capture so we run before Syncfusion's own handlers.
    this.micButtonHost.addEventListener(
      'mousedown',
      (e: MouseEvent) => {
        e.preventDefault();
        // Make sure the editor is focused BEFORE recognition starts.
        try {
          this.documentEditor.focusIn();
        } catch {
          /* editor not ready */
        }
      },
      true
    );
  }

  /**
   * Subscribes to language change and SpeechToText events.
   * Uses the typed event args defined by the official SpeechToText skill.
   */
  private wireEvents(): void {
    this.langSelect?.addEventListener('change', () => {
      this.setLanguage(this.langSelect!.value);
    });

    this.speechToText.onStart = (args: StartListeningEventArgs) => this.handleStart(args);
    this.speechToText.onStop = (args: StopListeningEventArgs) => this.handleStop(args);
    this.speechToText.onError = (args: ErrorEventArgs) => this.handleError(args);
    this.speechToText.transcriptChanged = (args: TranscriptChangedEventArgs) =>
      this.handleTranscriptChanged(args);
  }

  /**
   * Listening started. Record state and prime the editor so it is focused when
   * recognition ends (otherwise the mic button retains focus after click and
   * `editor.insertText()` silently fails).
   */
  private handleStart(_args: StartListeningEventArgs): void {
    this.host.classList.add(this.listeningClass);
    this.setStatus('Listening...');

    // Best-effort: keep the Document Editor focused so the cursor is ready for insertion.
    try {
      this.documentEditor.focusIn();
    } catch {
      /* editor not ready yet; harmless */
    }
  }

  /**
   * Listening stopped. Insert the transcript at the current cursor.
   *
   * CRITICAL: clicking the mic button shifts focus to the button (or its
   * Syncfusion Button widget). We MUST refocus the Document Editor BEFORE
   * calling `editor.insertText()`, otherwise the cursor is gone and
   * insertText silently no-ops. We do this synchronously here.
   */
  private handleStop(args: StopListeningEventArgs): void {
    this.host.classList.remove(this.listeningClass);

    // Per the skill, transcript is on the event args; fall back to the
    // component's `transcript` property if the event arg doesn't carry it.
    const transcript: string =
      (args && (args as any).transcript) || this.speechToText.transcript || '';

    // Refocus the editor synchronously so the cursor is active.
    try {
      this.documentEditor.focusIn();
    } catch {
      /* editor may have been destroyed */
    }

    if (transcript) {
      try {
        this.documentEditor.editor.insertText(transcript + ' ');
      } catch {
        // Editor may not be ready or destroyed; skip silently.
      }
    }

    // Reset live transcript so the next session starts clean.
    try {
      this.speechToText.transcript = '';
    } catch {
      /* noop */
    }

    this.setStatus('Click the mic to start dictating...');
  }

  /**
   * Recognition error. Keep the typed event args from the skill.
   */
  private handleError(args: ErrorEventArgs): void {
    this.host.classList.remove(this.listeningClass);
    const message: string = args.errorMessage || 'Speech recognition error.';
    this.setStatus(message);
    if (args.error === 'unsupported-browser') {
      this.disable();
    }
  }

  /**
   * Transcript updates. Per the skill, `isInterimResult` distinguishes live
   * partial results from final results. We don't insert interim results
   * (mirrors the Blazor reference which inserts on stop only), but we keep
   * the hook wired so callers can extend it.
   */
  private handleTranscriptChanged(args: TranscriptChangedEventArgs): void {
    // Intentionally a no-op: insertion happens on stop (handleStop) for
    // accuracy. Subclasses or wrappers can override this for live streaming.
    void args;
  }

  private setStatus(message: string): void {
    if (this.statusEl) {
      this.statusEl.textContent = message;
    }
  }

  /**
   * Programmatically change the recognition language.
   */
  public setLanguage(lang: string): void {
    this.language = lang;
    if (this.speechToText) {
      this.speechToText.lang = lang;
    }
  }

  /**
   * Disables the bar (e.g. when the browser has no Web Speech API).
   */
  public disable(): void {
    this.host.classList.add(this.disabledClass);
    if (this.speechToText) {
      this.speechToText.disabled = true;
    }
  }

  /**
   * Tears down the bar and its SpeechToText instance.
   */
  public destroy(): void {
    if (this.speechToText) {
      try {
        this.speechToText.stopListening();
      } catch {
        /* noop */
      }
      try {
        this.speechToText.destroy();
      } catch {
        /* noop */
      }
    }
    this.host.innerHTML = '';
    this.host.classList.remove('e-dictation-bar', this.listeningClass, this.disabledClass);
  }
}
