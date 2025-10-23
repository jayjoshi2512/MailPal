import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/components/ui/button';
import { Input } from '@/components/components/ui/input';
import { Card } from '@/components/components/ui/card';

// Custom styles for lists
const editorStyles = `
    .rich-text-editor ul {
        list-style-type: disc;
        padding-left: 2rem;
        margin: 0.5rem 0;
    }
    .rich-text-editor ol {
        list-style-type: decimal;
        padding-left: 2rem;
        margin: 0.5rem 0;
    }
    .rich-text-editor li {
        margin: 0.25rem 0;
    }
    .rich-text-editor ul ul {
        list-style-type: circle;
    }
    .rich-text-editor ul ul ul {
        list-style-type: square;
    }
    .rich-text-editor a {
        color: #3b82f6;
        text-decoration: underline;
    }
`;

/**
 * Professional Rich Text Editor - Gmail-style WYSIWYG editor
 * Production-grade with cursor fix and active state indicators
 */
const RichTextEditor = ({ value, onChange, placeholder, className }) => {
    const editorRef = useRef(null);
    const colorPickerRef = useRef(null);
    const bgColorPickerRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState({});
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');

    // Initialize editor content only once
    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value || '';
        }
    }, []);

    // Update active formats on selection change
    const updateActiveFormats = useCallback(() => {
        const formats = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull'),
        };
        setActiveFormats(formats);
    }, []);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const handleSelectionChange = useCallback(() => {
        updateActiveFormats();
    }, [updateActiveFormats]);

    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [handleSelectionChange]);

    const execCommand = useCallback((command, value = null) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        setTimeout(() => {
            updateActiveFormats();
            handleInput();
        }, 10);
    }, [updateActiveFormats, handleInput]);

    const handleOpenLinkModal = useCallback(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        if (!selectedText) {
            // If no text selected, show toast message
            return;
        }

        setLinkText(selectedText);
        setLinkUrl('https://');
        setShowLinkModal(true);
    }, []);

    const handleInsertLink = useCallback(() => {
        if (linkUrl.trim() && linkText) {
            execCommand('createLink', linkUrl.trim());
            setShowLinkModal(false);
            setLinkUrl('');
            setLinkText('');
        }
    }, [linkUrl, linkText, execCommand]);

    const handleCancelLink = useCallback(() => {
        setShowLinkModal(false);
        setLinkUrl('');
        setLinkText('');
    }, []);

    const handleColor = useCallback((type) => {
        const input = type === 'text' ? colorPickerRef.current : bgColorPickerRef.current;
        input?.click();
    }, []);

    const applyColor = useCallback((e, type) => {
        const color = e.target.value;
        execCommand(type === 'text' ? 'foreColor' : 'hiliteColor', color);
    }, [execCommand]);

    const handleFontSize = useCallback((e) => {
        execCommand('fontSize', e.target.value);
    }, [execCommand]);

    const handleFontName = useCallback((e) => {
        execCommand('fontName', e.target.value);
    }, [execCommand]);

    // Button component with active state
    const FormatButton = ({ command, icon, title, onClick }) => {
        const isActive = activeFormats[command];
        return (
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 hover:bg-accent transition-colors ${
                    isActive ? 'bg-accent text-blue-600' : ''
                }`}
                onClick={onClick || (() => execCommand(command))}
                title={title}
            >
                <i className={`${icon} text-base ${isActive ? 'font-bold' : ''}`}></i>
            </Button>
        );
    };

    return (
        <div className={`border border-border rounded-lg overflow-hidden relative ${className}`}>
            {/* Inject custom styles */}
            <style>{editorStyles}</style>
            
            {/* Professional Toolbar - Gmail Style */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/20">
                {/* Font Family */}
                <select
                    onChange={handleFontName}
                    className="h-8 text-xs border border-border rounded px-2 bg-background hover:bg-accent transition-colors cursor-pointer"
                    defaultValue="Arial"
                    title="Font"
                >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                </select>

                {/* Font Size */}
                <select
                    onChange={handleFontSize}
                    className="h-8 text-xs border border-border rounded px-2 bg-background hover:bg-accent transition-colors cursor-pointer"
                    defaultValue="3"
                    title="Font Size"
                >
                    <option value="1">10px</option>
                    <option value="2">13px</option>
                    <option value="3">16px</option>
                    <option value="4">18px</option>
                    <option value="5">24px</option>
                    <option value="6">32px</option>
                    <option value="7">48px</option>
                </select>

                <div className="w-px h-6 bg-border mx-1"></div>

                {/* Text Formatting */}
                <FormatButton command="bold" icon="ri-bold" title="Bold (Ctrl+B)" />
                <FormatButton command="italic" icon="ri-italic" title="Italic (Ctrl+I)" />
                <FormatButton command="underline" icon="ri-underline" title="Underline (Ctrl+U)" />

                <div className="w-px h-6 bg-border mx-1"></div>

                {/* Colors */}
                <div className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        onClick={() => handleColor('text')}
                        title="Text Color"
                    >
                        <i className="ri-font-color text-base"></i>
                    </Button>
                    <input
                        ref={colorPickerRef}
                        type="color"
                        className="absolute opacity-0 pointer-events-none"
                        onChange={(e) => applyColor(e, 'text')}
                    />
                </div>
                <div className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent"
                        onClick={() => handleColor('bg')}
                        title="Highlight Color"
                    >
                        <i className="ri-mark-pen-line text-base"></i>
                    </Button>
                    <input
                        ref={bgColorPickerRef}
                        type="color"
                        className="absolute opacity-0 pointer-events-none"
                        onChange={(e) => applyColor(e, 'bg')}
                    />
                </div>

                <div className="w-px h-6 bg-border mx-1"></div>

                {/* Lists */}
                <FormatButton command="insertUnorderedList" icon="ri-list-unordered" title="Bullet List" />
                <FormatButton command="insertOrderedList" icon="ri-list-ordered" title="Numbered List" />

                <div className="w-px h-6 bg-border mx-1"></div>

                {/* Alignment */}
                <FormatButton command="justifyLeft" icon="ri-align-left" title="Align Left" />
                <FormatButton command="justifyCenter" icon="ri-align-center" title="Align Center" />
                <FormatButton command="justifyRight" icon="ri-align-right" title="Align Right" />
                <FormatButton command="justifyFull" icon="ri-align-justify" title="Justify" />

                <div className="w-px h-6 bg-border mx-1"></div>

                {/* Indentation */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent"
                    onClick={() => execCommand('indent')}
                    title="Increase Indent"
                >
                    <i className="ri-indent-increase text-base"></i>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent"
                    onClick={() => execCommand('outdent')}
                    title="Decrease Indent"
                >
                    <i className="ri-indent-decrease text-base"></i>
                </Button>

                <div className="w-px h-6 bg-border mx-1"></div>

                {/* Link */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent"
                    onClick={handleOpenLinkModal}
                    title="Insert Link"
                >
                    <i className="ri-link text-base"></i>
                </Button>

                {/* Remove Link */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent"
                    onClick={() => execCommand('unlink')}
                    title="Remove Link"
                >
                    <i className="ri-link-unlink text-base"></i>
                </Button>

                <div className="w-px h-6 bg-border mx-1"></div>

                {/* Clear Formatting */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent"
                    onClick={() => execCommand('removeFormat')}
                    title="Clear Formatting"
                >
                    <i className="ri-format-clear text-base"></i>
                </Button>
            </div>

            {/* Editor Content Area - Fixed cursor issue + More compact */}
            <div className="relative">
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className="rich-text-editor min-h-[200px] max-h-[350px] overflow-y-auto p-2.5 outline-none text-sm leading-relaxed focus:bg-background"
                    style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                    }}
                    suppressContentEditableWarning
                />

                {/* Placeholder */}
                {!value && (
                    <div 
                        className="absolute top-4 left-4 pointer-events-none text-muted-foreground select-none"
                        style={{ userSelect: 'none' }}
                    >
                        {placeholder}
                    </div>
                )}
            </div>

            {/* Professional Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Text to Display</label>
                                <Input
                                    value={linkText}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">URL</label>
                                <Input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleInsertLink();
                                        } else if (e.key === 'Escape') {
                                            handleCancelLink();
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelLink}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleInsertLink}
                                disabled={!linkUrl.trim()}
                            >
                                Insert Link
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;
