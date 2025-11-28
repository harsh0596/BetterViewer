import type { PlasmoCSConfig } from "plasmo";
import { sendToBackground } from "@plasmohq/messaging";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end",
};

try {
  const isNewImageTabChromium = () => {
    // is body styled correctly
    const isStyledCorrectly =
      document.body.getAttribute("style") ===
      "margin: 0px; height: 100%; background-color: rgb(14, 14, 14);";
    // is body has only one child and it is image
    const hasSingleImageChild =
      document.body.children.length === 1 &&
      document.body.children[0]?.tagName === "IMG";
    // is image src matching
    const isImageSrcMatching =
      document.body.children[0]?.getAttribute("src") === window.location.href;

    return isStyledCorrectly && hasSingleImageChild && isImageSrcMatching;
  };

  const isNewImageTabFirefox = () => {
    // is body only has one child and it is image
    const hasSingleImageChild =
      document.body.children.length === 1 &&
      document.body.children[0]?.tagName === "IMG";

    // head has "resource://content-accessible/ImageDocument.css" stylesheet
    const hasImageDocumentStylesheet = (() => {
      const headChildren = document.head.children;
      const headChildrenLength = headChildren.length;
      for (let i = 0; i < headChildrenLength; i++) {
        if (headChildren.item(i).tagName === "LINK" && 
          headChildren.item(i).getAttribute("href") === "resource://content-accessible/ImageDocument.css"
        ) {
          return true;
        }
      }
      return false;
    })();

    return hasSingleImageChild && hasImageDocumentStylesheet;
  };

  if (isNewImageTabChromium() || isNewImageTabFirefox()) {
    console.log("This is a new image tab");
    sendToBackground({
      name: "openImageInNewTab" as never,
      body: {
        src: document.body.children[0]?.getAttribute("src"),
      },
    });
  }
} catch (error) {
  console.error("An error occurred:", error);
}
