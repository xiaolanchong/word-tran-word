import React, { useState, useEffect } from "react";
import { getDeck } from './User.js';
import queryString from 'query-string';
import Editable from "./Editable";
import VirtualKeyboardInput from "./VirtualKeyboardInput";

function InputEditable({ethalon, onChange=((text) => {}), language}) {
   const [typedText, setTypedText] = useState("");
  /*
    Enclose the input element as the children to the Editable component to make it as inline editable.
  */
  return (
    <Editable
      text={typedText}
      placeholder="Ввести слово"
      type="input"
    >
      <VirtualKeyboardInput
        name="typed_text"
        placeholder=''
        input_text={typedText}
        ethalon={ethalon}
        onChange={text => { setTypedText(text); onChange(text);}}
        language={language}
      />
    </Editable>
  );
}

function RowL2 ({l1Word, l2Word, language}) {
   const [isCorrect, setCorrect] = useState(false);
   const onChangeText = (text) => {
      if (text.length === 0) {
         setCorrect(false);
      } else {
         setCorrect(l1Word === text);
      }
   }
   const editable = <InputEditable 
                        ethalon={l1Word} 
                        onChange={onChangeText}
                        language={language}
                    />;
   return  (<tr>
               <td className=''>{l2Word}</td>
               <td>
                  {editable}
               </td>
               <td className='text-success'>{isCorrect ? '\u2713' : ''}</td>
            </tr>)
}

const Mode = Object.freeze({
      ShowBoth: 1,
      TestL1Translation: 2,
      TestL2Translation: 3
   })
   
const tableStyle = "table table-striped  table-nonfluid border";

function ShowBoth({rows}) {
   const rowElements = rows.map(
                  (item, index) =>  
                     (<tr key={index}>
                           <td>{item[0]}</td>
                           <td>{item[1]} </td>
                     </tr>)
   );
   return (
         <table className={tableStyle}>
            <thead className="thead-light">
               <tr>
                  <th style={{ width: '50%'}}>Слово</th>
                  <th>Перевод</th>
               </tr>
            </thead>
            <tbody>
               {rowElements}
            </tbody>
         </table>
   );
}

function L1Controls() {
   const Step = Object.freeze({
         ShowOkFailed: 1,
         Ok: 2,
         Failed: 3
      })
   const [step, setStep] = useState(Step.ShowOkFailed);
   switch(step) {
      case Step.ShowOkFailed:
         return <div>
                  <button className='btn btn-success btn-sm ml-1' onClick={()=> {setStep(Step.Ok)}}>
                     Помню
                  </button>
                  <button className={'btn btn-danger btn-sm ml-1'} onClick={()=> {setStep(Step.Failed)}}>
                     Забыл
                  </button>
                </div>
      case Step.Ok:
         return <div className="text-success">{'\u2713'}</div>
      case Step.Failed:
         return <div className="text-danger">{'\u2717'}</div>
      default:
         return null;
   }
}

function TestL1Translation({rows}) {
   const L1Row = ({item}) => {
      return <tr>
               <td>{item[0]}</td>
               <td>{isL2Shown? item[1] : '\u00A0'.repeat(item[1].length)}
               </td>
               <td className="p-0 align-middle text-center">
                  { isL2Shown ? <L1Controls /> : '' }
               </td>
            </tr>
   };
   const [isL2Shown, showL2] = useState(false);
   const rowElements = rows.map(
      (item, index) => <L1Row item={item} key={index}/>
   );
   return (
         <table className={tableStyle}>
            <thead className="thead-light">
               <tr>
                  <th >Слово</th>
                  <th >Перевод</th>
                  <th style={{ width: '150px'}} className="p-0 align-middle text-center">
                     <button className={'btn btn-outline-info btn-sm ' + (isL2Shown ? 'disabled' : '')} onClick={()=> {showL2(true)}}>
                        Показать
                     </button>
                  </th>
               </tr>
            </thead>
            <tbody>
               {rowElements}
            </tbody>
         </table>
   );
}

function TestL2Translation({rows, language}) {
   const rowElements = rows.map(
         (item, index) => <RowL2 l1Word={item[0]} 
                                 l2Word={item[1]} 
                                 language={language}
                                 key={index} />
   );
   return (
         <table className={tableStyle}>
            <thead className="thead-light">
               <tr>
                  <th style={{ width: '45%'}}>Перевод</th>
                  <th style={{ width: '45%'}}>Слово</th>
                  <th>Ок?</th>
               </tr>
            </thead>
            <tbody>
               {rowElements}
            </tbody>
         </table>
   );
}

function FragmentMode({rows, language, name}) {
   const [mode, setMode] = useState(Mode.TestL1Translation);

   let modeTable = null;
   switch(mode) {
      case Mode.ShowBoth:          modeTable = <ShowBoth rows={rows} />; break;
      case Mode.TestL1Translation: modeTable = <TestL1Translation rows={rows} />; break;
      case Mode.TestL2Translation: modeTable = <TestL2Translation rows={rows} language={language} />; break;
      default:
   }

   return (
      <div className="mt-3 ml-1 ">
         <div className=''>
          <div className="btn-group btn-group-toggle   " data-toggle="buttons">
           <label className={"btn btn-sm btn-secondary " + ((mode === Mode.ShowBoth)? 'active' : '')}
                  title='Слово и перевод'>
             <input type="radio" name="options" id="option1" autoComplete="off" checked={mode === Mode.ShowBoth}
                    onChange={() => setMode(Mode.ShowBoth)} />
             Сл+пер
           </label>
           <label className={"btn btn-sm btn-secondary " + ((mode === Mode.TestL1Translation)? 'active' : '')}
                  title='Слово в перевод'>
             <input type="radio" name="options" id="option2" autoComplete="off" checked={mode === Mode.TestL1Translation}
                    onChange={() => setMode(Mode.TestL1Translation)} />
             Сл→Пер
           </label>
           <label className={"btn btn-sm btn-secondary " + ((mode === Mode.TestL2Translation)? 'active' : '')}
                  title='Перевод в слово'>
             <input type="radio" name="options" id="option3" autoComplete="off" checked={mode === Mode.TestL2Translation}
                    onChange={() => setMode(Mode.TestL2Translation)} />
             Пер→Сл
           </label>
           
          </div>
         </div>
         <div className=''>
            <div className=' '>
               {modeTable}
            </div>
         </div>
      </div>
      );
}

function Matrix(props) {
   const [deck, setDeck] = useState({rows:[], name: '', language: ''});
   
   useEffect(() => {
      if(deck.name === ''){
         deckGetter();
      }
   });
   
   const urlParams = queryString.parse(props.location.search);
   if (urlParams.id === undefined) {
      return null;
   }

   const deckId = urlParams.id;
   const deckGetter = async () => {
      const deckD = await getDeck(deckId, 0, 100);
      setDeck(deckD);
   }

   const chunk_size = 5;

   let fragments = [];
   for (let i=0, size = deck.rows.length; i < size; i += chunk_size) {
      const temparray = deck.rows.slice(i, i + chunk_size);
      const fragmentData = { 
                     rows: temparray, 
                     name : '' + (i + 1) + '-' + (i + temparray.length),
                     language : deck.language
                   };
      fragments.push(<FragmentMode key={i} {...fragmentData} />);
   }
   return (<div>
              <h2 className="ml-3">{deck.name}</h2>
              <div className='m-1'>
                 <div>
                    <VirtualKeyboardInput/>
                 </div>
                 <div>
                    <VirtualKeyboardInput
                      placeholder=''
                      input_text=''
                      language='ko' />
                 </div>
                 <div>
                    <VirtualKeyboardInput
                      placeholder=''
                      input_text=''
                      language='ja' />
                 </div>
              </div>
              <div>
                 {fragments}
              </div>
           </div>);
}

export { Matrix };