function dl(filename) {
  const a = document.createElement('a');
  a.href = filename;
  a.download = filename;
  a.click();
}