import JSMLComponent from "../../../../JSMLComponent.js";

function main(){
    const instruction = "Push the button to sea the « README.md »."
    const MAIN = new JSMLComponent();

    MAIN.main({ className: "mljs-main-container" })
        .p({ textContent: "Welcome to the mini website " })
            .b({ textContent: "Simpljs" }).end()
            .txt(" to discover the potential of this little library")
        .end()
        .p({ className: "mljs-main-display-zone", textContent:instruction }).end()
    .end();
    MAIN.in($("#app"));
}

export { main };