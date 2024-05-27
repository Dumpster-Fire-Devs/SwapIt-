// The path to the replacement image
const replacementImagePath = chrome.runtime.getURL("images/rep.png");

// Function to replace all images and background images
function replaceImages() {
  const images = document.getElementsByTagName('img');
  for (let img of images) {
    if (img.src !== replacementImagePath) {
      img.src = replacementImagePath;
      img.srcset = '';  // Clear srcset to prevent loading different resolutions
      img.style.objectFit = 'cover'; // Ensure the image covers the area correctly
    }
  }

  const elementsWithBg = document.querySelectorAll('*');
  for (let element of elementsWithBg) {
    const bgImage = window.getComputedStyle(element).backgroundImage;
    if (bgImage && bgImage !== 'none' && !bgImage.includes(replacementImagePath)) {
      element.style.backgroundImage = `url("${replacementImagePath}")`;
    }
  }

  const objectElements = document.getElementsByTagName('object');
  for (let object of objectElements) {
    if (object.data !== replacementImagePath) {
      object.data = replacementImagePath;
    }
  }

  const embedElements = document.getElementsByTagName('embed');
  for (let embed of embedElements) {
    if (embed.src !== replacementImagePath) {
      embed.src = replacementImagePath;
    }
  }

  const iframeElements = document.getElementsByTagName('iframe');
  for (let iframe of iframeElements) {
    const src = iframe.src;
    if (src && !src.includes(replacementImagePath) && src.match(/\.(gif|jpe?g|png|bmp|webp|tiff?|heif|raw|ico|svg|jp2|xcf)(\?.*)?$/i)) {
      iframe.src = replacementImagePath;
    }
  }
}

// Debounce function to limit the frequency of replaceImages calls
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Initial replacement of images when the content script runs
replaceImages();

// Observe changes to the DOM to replace images in dynamically loaded content
const observer = new MutationObserver(debounce((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      replaceImages();
    }
  });
}, 500)); // Debounce with a 500ms delay

// Observe the entire document for added nodes
observer.observe(document.body, { childList: true, subtree: true });
