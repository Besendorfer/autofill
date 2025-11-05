// AWS Console Autofill - Content Script
// Autofills confirmation text fields in AWS Console

(function() {
  'use strict';

  // Configuration for different autofill rules
  const AUTOFILL_RULES = {
    // S3 Delete Files confirmation
    's3-delete': {
      requiredText: 'permanently delete'
    }
  };

  /**
   * Attempts to autofill a text input field
   */
  function autofillField(input, text) {
    if (!input || input.disabled || input.readOnly || input.value === text) {
      return input?.value === text;
    }

    // Use native setter to bypass React's tracking
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, text);
    } else {
      input.value = text;
    }

    // Clear React's value tracker if it exists
    if (input._valueTracker) {
      input._valueTracker.setValue('');
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, text);
      } else {
        input.value = text;
      }
    }

    // Trigger React events
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    Object.defineProperty(inputEvent, 'target', { writable: false, value: input });
    input.dispatchEvent(inputEvent);

    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    Object.defineProperty(changeEvent, 'target', { writable: false, value: input });
    input.dispatchEvent(changeEvent);

    return true;
  }

  /**
   * Checks if an input field matches our autofill rules and autofills if needed
   */
  function checkAndAutofill(input) {
    if (input.disabled || input.readOnly || (input.value && input.value !== '')) {
      return false;
    }

    for (const rule of Object.values(AUTOFILL_RULES)) {
      const placeholder = (input.placeholder || '').toLowerCase();
      const label = (input.getAttribute('aria-label') || '').toLowerCase();
      const ariaLabelledBy = input.getAttribute('aria-labelledby');

      let labelledByText = '';
      if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        if (labelElement) {
          labelledByText = (labelElement.textContent || '').toLowerCase();
        }
      }

      // Check if placeholder or label contains the required text
      const hasMatch = placeholder.includes(rule.requiredText) ||
                      label.includes(rule.requiredText) ||
                      labelledByText.includes(rule.requiredText);

      if (hasMatch) {
        return autofillField(input, rule.requiredText);
      }
    }

    return false;
  }

  /**
   * Observes the DOM for new input fields that might need autofilling
   */
  function observeForNewFields() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Check if the added node is an input field
            if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
              setTimeout(() => checkAndAutofill(node), 100);
            }

            // Check for input fields within the added node
            const inputs = node.querySelectorAll?.('input[type="text"], input[type="password"], textarea');
            inputs?.forEach(input => {
              setTimeout(() => checkAndAutofill(input), 100);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Periodically check existing fields (for modals that might already be open)
    setInterval(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="password"], textarea');
      inputs.forEach(input => {
        if (input.offsetParent !== null && !input.value) {
          checkAndAutofill(input);
        }
      });
    }, 500);
  }

  /**
   * Initialize the autofill functionality
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeForNewFields);
    } else {
      observeForNewFields();
    }

    // Check existing fields after a short delay
    setTimeout(() => {
      document.querySelectorAll('input[type="text"], input[type="password"], textarea')
        .forEach(checkAndAutofill);
    }, 1000);
  }

  // Start the extension
  init();
})();

