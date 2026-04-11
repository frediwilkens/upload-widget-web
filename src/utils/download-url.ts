export const downloadUrl = async (url: string) => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
    });
    const blob = await response.blob();
    const link = document.createElement("a");

    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    const segments = pathname.split("/").filter(segment => segment.length > 0);
    const filename = segments.length > 0 ? segments[segments.length - 1] : null;

    if (!filename) {
      throw new Error("URL does not contain a valid filename");
    }

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading file", error)
  }
}