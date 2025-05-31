import { Waiter } from "../../../../Simpljs.js";

function addActInsertReadme() {
  Waiter.addAct({
    insertReadme() {
      fetch("README.html")
        .then((response) => response.text())
        .then((text) => ($(".mljs-main-display-zone").innerHTML = text));
    },
    removeReadme() {
      $(".mljs-main-display-zone").textContent =
        "Push the button to sea the « README.md ».";
    },
  });
}

function addActShowLicense() {
  Waiter.addAct("showLicense", function () {
    //LOAD MODAL LICENSE
    $("<modalLicense>")
      .refresh({ modalContent: "Click next to see the license.", id: 0 })
      .in($("#app"));
  });
}

export { addActInsertReadme, addActShowLicense };
