import JSMLComponent from "../../../../JSMLComponent.js";

function footer(){
    const date = new Date();
    const FOOTER = new JSMLComponent()
        .footer({
            className:"mljs-footer", 
            textContent:`Copyright © ${date.getFullYear()} Juan Claudio`,
            style:"padding: 10px; text-align: center;"
        }).end();
    FOOTER.in($("#app"));
}

export { footer };