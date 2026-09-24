// Editorial study sequences, not formal admission requirements. Arrays within a
// stage are course options, while stages progress from foundations to application.
export const paths=[
 {id:'nt',title:'Read the New Testament in Greek',section:'Biblical Studies',stages:[{title:'Survey',ids:['c4','c7']},{title:'Greek foundations',ids:['c10']},{title:'Greek exegesis I',ids:['c12']},{title:'Greek exegesis II',ids:['c13']},{title:'Book studies',ids:['c14','c15','c16','c17','c18','c19','c20','c21']}]},
 {id:'ot',title:'Read the Old Testament in Hebrew',section:'Biblical Studies',stages:[{title:'Survey',ids:['c9','c8']},{title:'Hebrew I',ids:['c22']},{title:'Hebrew II',ids:['c23']},{title:'Hebrew exegesis I',ids:['c24']},{title:'Hebrew exegesis II',ids:['c25']},{title:'Book studies',ids:['c26','c27','c28']}]},
 {id:'nt-survey',title:'Survey the New Testament in two parts',section:'Biblical Studies',stages:[{title:'Gospels & Acts',ids:['c2']},{title:'Romans to Revelation',ids:['c3']},{title:'Biblical theology',ids:['c51','c36']}]},
 {id:'history',title:'Trace the history of the church',section:'Theology & History',stages:[{title:'Early & medieval',ids:['c31']},{title:'Reformation & modern',ids:['c33']},{title:'Focused studies',ids:['c60','c59']}]},
 {id:'history-bray',title:'Church history with Gerald Bray',section:'Theology & History',stages:[{title:'Church History I',ids:['c30']},{title:'Church History II',ids:['c32']}]},
 {id:'theology',title:'Build a theological framework',section:'Theology & History',stages:[{title:'Scriptural foundations',ids:['c9','c4']},{title:'Systematic Theology I',ids:['c34']},{title:'Systematic Theology II',ids:['c35']},{title:'Focused theology',ids:['c64','c65']}]},
 {id:'philosophy',title:'Develop philosophical fluency',section:'Philosophy, Ethics, etc.',stages:[{title:'Introduction',ids:['c44','c45']},{title:'Ancient philosophy',ids:['c42']},{title:'Modern philosophy',ids:['c43']},{title:'Later traditions',ids:['c66','c67']}]}
];
export function adjacentCourses(id){const before=new Set(),after=new Set();for(const p of paths){const i=p.stages.findIndex(s=>s.ids.includes(id));if(i>0)p.stages[i-1].ids.forEach(x=>before.add(x));if(i>=0&&i<p.stages.length-1)p.stages[i+1].ids.forEach(x=>after.add(x));}return{before:[...before],after:[...after]};}
