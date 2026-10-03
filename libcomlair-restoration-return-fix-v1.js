(()=>{
  "use strict";

  function isPlainSubcategoryScreen(){
    const body=document.body;
    return body.classList.contains("v224-page5-step")
      && !body.classList.contains("v224-results-step")
      && !body.classList.contains("v224-utility-step")
      && !body.classList.contains("v224-result-tool-page");
  }

  document.addEventListener("click",event=>{
    const button=event.target?.closest?.("#v224MasterReturn");
    if(!button||!isPlainSubcategoryScreen())return;
    const flow=window.LibcomlairPageFlow;
    if(!flow?.showSearch)return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==="function")event.stopImmediatePropagation();
    flow.showSearch();
  },true);

  window.LibcomlairRestorationReturnFix=Object.freeze({
    version:"v1-search-page-return",
    active:isPlainSubcategoryScreen
  });
})();
