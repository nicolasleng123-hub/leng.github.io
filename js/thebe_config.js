window.thebeConfig = {
  requestKernel: true,
  kernelOptions: {
    kernelName: "python3"
  },
  binderOptions: {
    repo: "binder-examples/requirements",
    ref: "master"
  },
  bootstrap: true,
  mountActivateWidget: true,
  serverSettings: {
    baseUrl: "https://mybinder.org"
  }
};