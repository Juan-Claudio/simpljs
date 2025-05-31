$("<modalLicense>", function(d){
    return this
    .div({className:"jsml-modal-container", id:`jsml-modalLicense-${d.id}`})
        .p({className:"jsml-modal-content", textContent: d.modalContent}).end()
        .btn({
            id:"jsml-modalLicense-btn-close", 
            className:"mljs-btn mljs-btn-1st",
            type:"button", 
            itle:"close", 
            textContent:"close"
        }).end()
        .btn({
            id:"jsml-modalLicense-btn-next",
            className:"mljs-btn mljs-btn-2nd",
            type:"button",
            title:'next',
            textContent:'next'
        }).end()
    .end()
});