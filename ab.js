const { createWorker } = require('tesseract.js');

(async () => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize('./image.png');
  console.log(ret.data.text);
  await worker.terminate();
})();