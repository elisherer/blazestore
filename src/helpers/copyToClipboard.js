const createTextArea = () => {
  const textArea = document.createElement("textarea");
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = 0;
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";
  return textArea;
};
function copyToClipboard(text) {
  const textArea = createTextArea();
  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let result = false;
  try {
    result = document.execCommand("copy");
  } catch (e) {
    console.error(e);
  }
  document.body.removeChild(textArea);
  return result;
}

export default copyToClipboard;
