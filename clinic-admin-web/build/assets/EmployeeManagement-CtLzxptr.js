import{u as i,j as t}from"./index-DIpuK5ve.js";import{F as c}from"./index.es-ylDXcgl1.js";import{f as n,a as l,b as m,c as p,d as h,e as f,g as d,h as y}from"./index-BS1iOPDO.js";import{C as u}from"./index.esm-D1QouA3b.js";import{C as x,a as C}from"./CRow-Bc5toSNl.js";import{C as j,a as b}from"./CCardBody-CNxitJn1.js";const U=()=>{const e=i(),r={doctor:y,nurse:d,pharmacist:f,laboratory:h,admin:p,frontDesk:m,security:l,otherStaff:n},s=[{title:"Doctor",type:"doctor",path:"/Doctor"},{title:"Nurse",type:"nurse",path:"/Nurse"},{title:"Pharmacist",type:"pharmacist",path:"/Pharmacist"},{title:"Lab Technician",type:"laboratory",path:"/Lab-Technician"},{title:"Administrator",type:"admin",path:"/Admin"},{title:"FrontDesk",type:"frontDesk",path:"/FrontDesk"},{title:"Security",type:"security",path:"/Security"},{title:"OtherStaff",type:"otherStaff",path:"/OtherStaff"}];return t.jsxs(u,{className:"mt-5",children:[t.jsx("style",{children:`
        
          .card-zoom {
            transition: transform 0.3s ease-in-out;
          }
          .card-zoom:hover {
            transform: scale(1.05);
          }
        `}),t.jsx("h2",{className:"text-center mb-4",children:"Employee Management"}),t.jsx(x,{className:"g-4 justify-content-start",children:s.map((a,o)=>t.jsx(C,{xs:12,sm:6,md:3,children:t.jsx(j,{className:"text-center shadow-lg p-3 card-zoom",style:{cursor:"pointer",backgroundColor:"var(--color-bgcolor)"},onClick:()=>e(a.path),children:t.jsxs(b,{children:[t.jsx(c,{icon:r[a.type],style:{fontSize:"70px",color:"var(--color-black)"},className:"mb-3"}),t.jsx("h5",{style:{color:"var(--color-black)"},children:a.title})]})})},o))})]})};export{U as default};
