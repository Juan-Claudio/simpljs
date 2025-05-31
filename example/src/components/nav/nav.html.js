import JSMLComponent from "../../../../JSMLComponent.js";

function nav(){
    const NAV = new JSMLComponent()
    .nav({className:"mljs-nav"})
        .btn({
            className:"mljs-btn mljs-btn-1st", 
            id:"mljs-alertVersion-btn", 
            textContent: "Display Version"
        }).end()
        .btn({
            className:"mljs-btn mljs-btn-2nd", 
            id:"mljs-showLicense-btn", 
            textContent: "Show License"
        }).end()
        .btn({
            className:"mljs-btn mljs-btn-2nd", 
            id:"mljs-toggleReadme-btn", 
            textContent: "Show README"
        }).end()
    .end();
    NAV.in($("#app"));
}

export { nav };