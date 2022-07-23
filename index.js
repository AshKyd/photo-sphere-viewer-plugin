import { Viewer } from "photo-sphere-viewer";
import cssText from "bundle-text:photo-sphere-viewer/dist/photo-sphere-viewer.css";

function coercify(string) {
  if (["true", "false"].includes(string)) {
    return string === "true";
  }
  if (String(Number(string)) === string) {
    return Number(string);
  }
  return string;
}

const photosphereStyle = `
.photo-sphere{
  aspect-ratio: 25/9;
  position:relative;
}
.photo-sphere__inner{
  position:absolute;
  left:0;
  top:0;
  width:100%;
  height:100%;
}
`;

// inject <style> tag
let style = document.createElement("style");
style.textContent = cssText + photosphereStyle;
style.classList.add("photo-sphere__style");
document.body.appendChild(style);

const spheres = document.querySelectorAll(
  ".photo-sphere:not(.photo-sphere--initialised):not(.photo-sphere__style)"
);

spheres.forEach((img) => {
  const url = img.src;
  const container = document.createElement("div");
  container.classList.add("photo-sphere");
  container.classList.add("photo-sphere--initialised");

  const inner = document.createElement("div");
  inner.classList.add("photo-sphere__inner");
  container.appendChild(inner);

  const dataOptions = {};
  Object.entries(img.dataset).forEach(([key, value]) => {
    dataOptions[key] = coercify(value);
  });

  img.parentElement.replaceChild(container, img);

  const viewer = new Viewer({
    panorama: url,
    ...dataOptions,
    container: inner,
    size: {
      width: 320,
      height: 240,
    },
  });

  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      if (entry.contentBoxSize) {
        // Firefox implements `contentBoxSize` as a single content rect, rather than an array
        const contentBoxSize = Array.isArray(entry.contentBoxSize)
          ? entry.contentBoxSize[0]
          : entry.contentBoxSize;

        viewer.setOption("size", {
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    }
  });

  resizeObserver.observe(container);
});
