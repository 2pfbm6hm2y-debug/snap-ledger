/* Snap Ledger text reader: runs Tesseract (bundled in lib/) off the main thread. */
let M = null, api = null;
self.onmessage = async (e) => {
  const d = e.data;
  try {
    if (d.type === 'init') {
      importScripts(d.coreUrl);
      M = await TesseractCore();
      M.FS.writeFile('eng.traineddata', new Uint8Array(d.lang));
      api = new M.TessBaseAPI();
      const st = api.Init(null, 'eng', 1, undefined);
      if (st !== 0) throw new Error('init failed ' + st);
      api.SetVariable('tessedit_pageseg_mode', '3');
      api.SetVariable('preserve_interword_spaces', '1');
      self.postMessage({ id: d.id, ok: true });
    } else if (d.type === 'rec') {
      M.FS.writeFile('/input', new Uint8Array(d.image));
      api.SetVariable('tessedit_pageseg_mode', String(d.psm || 3));
      if (d.vars) Object.keys(d.vars).forEach(k => api.SetVariable(k, String(d.vars[k])));
      if (api.SetImageFile(1, 0) === 1) throw new Error('image not readable');
      api.Recognize(null);
      const tsv = api.GetTSVText(0);
      api.Clear();
      self.postMessage({ id: d.id, ok: true, tsv });
    }
  } catch (err) {
    self.postMessage({ id: d.id, ok: false, error: String((err && err.message) || err) });
  }
};
