import Mljs from "../Mljs";

function component1_html(){
   const iter = ["./bash_logo.svg", "./javascript-1.svg"];

   const var1 = 101;
   const var2 = 1025;

   const list = new Mljs();
   list
      .ul()
         .if(var1 > 100)
            .div({ textContent: "Greater than 100" })
            .div(0)
         .elseif(var1 > 70)
            .div({ textContent: "Greater than 70" })
            .div(0)
         .else()
            .div({ textContent: "Lesser or equal to 70" })
            .div(0)
         .if(0)
         .loop(iter)
            .li({ id: `li-{{idx}}` })
               .img({ id: `img-{{idx}}`, src: "{{val}}", width: 32 })
            .li(0)
         .loop(0)
      .ul(0);
   list.insertInto(document.querySelector("#app"));
}

export {component1_html};