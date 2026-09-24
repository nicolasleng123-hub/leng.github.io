document.addEventListener("DOMContentLoaded", function () {
  const cells = document.querySelectorAll(
    'pre[data-executable="true"][data-language="python"]'
  );

  if (!cells.length) {
    return;
  }

  const codeMirrorPromise = Promise.all([
    import("https://esm.sh/@codemirror/view@6.38.6"),
    import("https://esm.sh/@codemirror/state@6.5.2"),
    import("https://esm.sh/@codemirror/lang-python@6.2.1"),
    import("https://esm.sh/codemirror@6.0.1")
  ]).then(function (modules) {
    return {
      EditorView: modules[0].EditorView,
      EditorState: modules[1].EditorState,
      python: modules[2].python,
      basicSetup: modules[3].basicSetup
    };
  });

  let pyodidePromise;
  const getPyodide = function () {
    if (!pyodidePromise) {
      pyodidePromise = loadPyodide(window.pyodideConfig || {});
    }
    return pyodidePromise;
  };

  const resetKernel = function () {
    pyodidePromise = undefined;
    document.querySelectorAll(".python-output").forEach(function (output) {
      output.textContent = "";
      output.hidden = true;
    });
  };

  cells.forEach(async function (cell) {
    const wrapper = document.createElement("div");
    wrapper.className = "python-cell-wrapper";
    cell.parentNode.insertBefore(wrapper, cell);

    const source = cell.textContent.replace(/^\n+|\n+$/g, "");
    const editorHost = document.createElement("div");
    editorHost.className = "python-editor";
    wrapper.appendChild(editorHost);
    cell.remove();

    const codeMirror = await codeMirrorPromise;
    const editorView = new codeMirror.EditorView({
      state: codeMirror.EditorState.create({
        doc: source,
        extensions: [codeMirror.basicSetup, codeMirror.python()]
      }),
      parent: editorHost
    });

    const button = document.createElement("button");
    button.type = "button";
    button.className = "python-run-button";
    button.textContent = "Executer";
    wrapper.appendChild(button);

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "python-reset-button";
    resetButton.textContent = "Réinitialiser Python";
    wrapper.appendChild(resetButton);

    const output = document.createElement("pre");
    output.className = "python-output";
    output.hidden = true;
    wrapper.appendChild(output);

    resetButton.addEventListener("click", function () {
      resetButton.disabled = true;
      resetButton.textContent = "Réinitialisation...";
      resetKernel();
      resetButton.textContent = "Réinitialiser Python";
      resetButton.disabled = false;
    });

    button.addEventListener("click", async function () {
      button.disabled = true;
      button.textContent = "Chargement de Python...";
      output.hidden = false;
      output.textContent = "";

      try {
        const pyodide = await getPyodide();
        let capturedOutput = "";
        pyodide.setStdout({
          batched: function (text) {
            capturedOutput += text + "\n";
          }
        });
        const result = await pyodide.runPythonAsync(editorView.state.doc.toString());
        const resultText = result === undefined ? "" : String(result);
        output.textContent = capturedOutput + resultText;
        if (result && typeof result.destroy === "function") {
          result.destroy();
        }
      } catch (error) {
        output.textContent = String(error);
      } finally {
        button.disabled = false;
        button.textContent = "Executer";
      }
    });
  });
});