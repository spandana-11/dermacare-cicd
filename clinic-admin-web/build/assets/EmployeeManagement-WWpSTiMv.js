import{h as i,j as t}from"./index-DOkwaX0Y.js";import{F as c}from"./index.es-Kj1Nn4h9.js";import{a as n,b as l,c as m,d as h,e as p,g as f,h as d,f as y}from"./index-BKFaBSu9.js";import{b as u}from"./index.esm-DAUg0Y0u.js";import{C as x,a as C}from"./CRow-C9-Fb04l.js";import{C as b,a as j}from"./CCardBody-DtQk2umz.js";const U=()=>{const e=i(),r={doctor:y,nurse:d,pharmacist:f,laboratory:p,admin:h,frontDesk:m,security:l,otherStaff:n},s=[{title:"Doctor",type:"doctor",path:"/Doctor"},{title:"Nurse",type:"nurse",path:"/Nurse"},{title:"Pharmacist",type:"pharmacist",path:"/Pharmacist"},{title:"Lab Technician",type:"laboratory",path:"/Lab-Technician"},{title:"Administrator",type:"admin",path:"/Admin"},{title:"FrontDesk",type:"frontDesk",path:"/FrontDesk"},{title:"Security",type:"security",path:"/Security"},{title:"OtherStaff",type:"otherStaff",path:"/OtherStaff"}];return t.jsxs(u,{className:"mt-5",children:[t.jsx("style",{children:`
        
          .card-zoom {
            transition: transform 0.3s ease-in-out;
          }
          .card-zoom:hover {
            transform: scale(1.05);
          }
        `}),t.jsx("h2",{className:"text-center mb-4",children:"Employee Management"}),t.jsx(x,{className:"g-4 justify-content-start",children:s.map((a,o)=>t.jsx(C,{xs:12,sm:6,md:3,children:t.jsx(b,{className:"text-center shadow-lg p-3 card-zoom",style:{cursor:"pointer",backgroundColor:"var(--color-bgcolor)"},onClick:()=>e(a.path),children:t.jsxs(j,{children:[t.jsx(c,{icon:r[a.type],style:{fontSize:"70px",color:"var(--color-black)"},className:"mb-3"}),t.jsx("h5",{style:{color:"var(--color-black)"},children:a.title})]})})},o))})]})};export{U as default};
