// content.js
if (window.veoTaggerLoaded) {
  console.log("Veo Tagger Content Script already loaded. Skipping.");
  // If we are re-injected, we might want to ensure listeners aren't duplicated.
  // Since we return early, the rest of the script won't run, so listeners won't be added again.
  // However, we need to make sure this return works for the top-level execution.
} else {
  window.veoTaggerLoaded = true;
  console.log("Veo Tagger Content Script Loaded");
}

// Wrap the rest of the logic in a block or just let it run if we didn't return?
// You can't easily "return" from a top-level script in all contexts, but we can wrap the rest in a check.
if (window.veoTaggerLoaded) {



  // Helper to find video element
  function findVideoElement() {
    // Try standard query first
    let video = document.querySelector('video');
    if (video) {
      console.log("Veo Tagger: Found video element directly");
      return video;
    }

    // Try to find video inside any iframes we can access (same-origin only)
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          video = iframeDoc.querySelector('video');
          if (video) {
            console.log("Veo Tagger: Found video inside iframe");
            return video;
          }
        }
      } catch (e) {
        // Cross-origin iframe, can't access - that's OK, content script runs in all_frames
      }
    }

    // Optional: Search in shadow DOMs
    const searchShadowRoots = (root) => {
      const elements = root.querySelectorAll('*');
      for (const el of elements) {
        if (el.shadowRoot) {
          const shadowVideo = el.shadowRoot.querySelector('video');
          if (shadowVideo) return shadowVideo;
          const nested = searchShadowRoots(el.shadowRoot);
          if (nested) return nested;
        }
      }
      return null;
    };
    video = searchShadowRoots(document);
    if (video) {
      console.log("Veo Tagger: Found video in shadow DOM");
      return video;
    }

    console.log("Veo Tagger: No video element found in this frame");
    return null;
  }

  // Listen for messages from Popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTimestamp") {
      const video = findVideoElement();

      if (video) {
        const currentTime = video.currentTime;
        console.log("Veo Tagger: Sending timestamp", currentTime);
        sendResponse({ status: "success", timestamp: currentTime });
        return true; // Keep message channel open
      }
      // IMPORTANT: Do NOT send a response if no video is found.
      // This allows other frames (that might have the video) to respond.
      // If no frame responds, the sender will get undefined/error, which is handled.
    } else if (request.action === "seekToTimestamp") {
      const video = findVideoElement();
      if (video) {
        video.currentTime = request.timestamp;
      }
    } else if (request.action === "getGameTitle") {
      console.log("Content script: getGameTitle action received");
      const titleElement = document.querySelector('.title-section');
      console.log("Content script: titleElement found:", titleElement);
      console.log("Content script: titleElement text:", titleElement ? titleElement.textContent : 'element is null');
      const title = titleElement ? titleElement.textContent.trim() : null;
      console.log("Content script: sending title:", title);
      sendResponse({ title: title });
      return false;
    }

    // Return false to close the message channel
    return false;
  });

  // Global Hotkey Listener
  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    // Get timestamp if video exists
    const video = findVideoElement();
    const timestamp = video ? video.currentTime : null;

    if (timestamp !== null) {
      chrome.runtime.sendMessage({
        action: "hotkeyPressed",
        key: e.key,
        timestamp: timestamp
      });
    }
  });
}
