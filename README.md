# AWS Console Autofill Extension

A Chrome extension that automatically fills confirmation text fields in the AWS Console, specifically for S3 delete operations.

## Features

- Automatically fills "permanently delete" in S3 delete confirmation fields
- Works seamlessly with AWS Console's React-based UI
- No configuration needed - works out of the box

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select this directory (`autofill`)
5. The extension is now installed and active!

**Note:** You may see a warning about missing icon files - this is fine for the MVP. The extension will work without icons.

## Usage

1. Navigate to the AWS Console (console.aws.amazon.com)
2. Go to S3 and select files you want to delete
3. Click the delete button
4. When the confirmation modal appears asking you to type "permanently delete", the field will be automatically filled!

## How It Works

The extension uses a content script that:
- Monitors the DOM for new input fields
- Detects when a delete confirmation modal appears
- Identifies the confirmation text field
- Automatically fills it with the required text ("permanently delete")

## Development

### File Structure

```
autofill/
├── manifest.json    # Extension manifest (v3)
├── content.js       # Content script that handles autofilling
└── README.md        # This file
```

### Adding More Autofill Rules

To add support for other AWS Console confirmation fields, edit `content.js` and add new rules to the `AUTOFILL_RULES` object:

```javascript
const AUTOFILL_RULES = {
  's3-delete': { ... },
  'new-rule': {
    selector: 'input[type="text"]',
    requiredText: 'your required text',
    contextCheck: (input) => { /* your logic */ }
  }
};
```

## Notes

- The extension only runs on AWS Console domains (console.aws.amazon.com)
- It uses mutation observers to detect new fields as they appear
- The extension is designed to be non-intrusive and only fills fields when appropriate

## License

MIT

