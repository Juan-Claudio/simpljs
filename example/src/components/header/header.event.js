import Waiter from "../../../../Waiter.js";

function reloadPageOnClickOnSimpljsTitle(bodyWaiter) {
  //register act
  Waiter.addAct({
    refresh() {
      window.location.reload();
    },
  });

  //create event to add to body Waiter
  return bodyWaiter.on("click").at(".mljs-title").arm("refresh").getArmId();
}

export { reloadPageOnClickOnSimpljsTitle };
