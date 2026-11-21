function slow({text,header}) {
 if(text.charCodeAt(0)===65279)text=text.slice(1);
 const rows=[],errors=[];let columns=null, width=null,line=1,i=0,record=0,start,row;
 const error=(code,props)=>errors.push({code,line:start,row,...props});
 while(i<text.length){
  if(text[i]==='\n'||text[i]==='\r'&&text[i+1]==='\n'){i+=text[i]==='\r'?2:1;line++;continue;}
  start=line;row=header?(record===0?null:record-1):record;const fields=[];let quoted=false;
  for(;;){
   let value='';
   quoted=text[i]==='"';
   if(quoted){
    let end=i+1;
    for(;end<text.length;end++){
     if(text[end]==='"'){if(text[end+1]==='"'){end++;continue;}break;}
    }
    if(end<text.length){
     value=text.slice(i+1,end).replace(/""|\r\n|\r|\n/g,m=>{if(m==='""')return '"';line++;return '\n';});i=end+1;
     const valueAtClose=value.length;
     while(i<text.length&&text[i]!==','&&text[i]!=='\n'&&!(text[i]==='\r'&&text[i+1]==='\n')){if(text[i]==='\r')error('stray_cr');else value+=text[i];i++;}
     if(value.length>valueAtClose)error('quote_junk');
    }else{
     error('unterminated_quote');
     while(i<text.length&&text[i]!==','&&text[i]!=='\n'&&!(text[i]==='\r'&&text[i+1]==='\n')){if(text[i]==='\r')error('stray_cr');else value+=text[i];i++;}
    }
   }else{
    const start=i;
    while(i<text.length&&text[i]!==','&&text[i]!=='\n'&&!(text[i]==='\r'&&text[i+1]==='\n'))i++;
    value=text.slice(start,i);if(value.includes('\r'))value=value.replace(/\r/g,()=>{error('stray_cr');return '';});
   }
   fields.push(value);
   if(text[i]!==',')break;
   i++;
  }
  if(fields.length===1&&fields[0]===''&&!quoted){if(i<text.length){i+=text[i]==='\r'?2:1;line++;}continue;}
  if(width===null)width=fields.length;
  if(header&&record===0){columns=fields;}else{
   if(fields.length<width){error('short_row',{fields:fields.length});while(fields.length<width)fields.push('');}
   else if(fields.length>width)error('long_row',{extra:fields.splice(width)});
   rows.push(fields);
  }
  record++;
  if(i<text.length){i+=text[i]==='\r'?2:1;line++;}
 }
 return {columns:header?(columns??[]):null,rows,errors};
}
export function run(input){
 let text=String(input.text),header=input.header===true;
 if(text.includes('"')||/\r(?!\n)/.test(text))return slow({text,header});
 if(text.charCodeAt(0)===65279)text=text.slice(1);
 const rows=[], errors=[];let columns=null,width=-1;
 const lines=text.includes('\r')?text.split(/\r?\n/):text.split('\n');
 for(let i=0;i<lines.length;i++){
  if(lines[i]==='')continue;
  const f=lines[i].split(',');
  if(width<0){width=f.length;if(header){columns=f;continue;}}
  if(f.length<width){errors.push({code:'short_row',line:i+1,row:rows.length,fields:f.length});while(f.length<width)f.push('');}
  else if(f.length>width)errors.push({code:'long_row',line:i+1,row:rows.length,extra:f.splice(width)});
  rows.push(f);
 }return {columns:header?(columns??[]):null,rows,errors};
}
