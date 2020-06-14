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

const Mode = Object.freeze({
      ShowWordAndTranslation: 1,
      TestTranslation: 2,
      TestWord: 3
   })
   
function ConfirmTranslationControls() {
   const Step = Object.freeze({
         ShowOkFailed: 1,
         Ok: 2,
         Failed: 3
      })
   const [step, setStep] = useState(Step.ShowOkFailed);
   switch(step) {
      case Step.ShowOkFailed:
         return <React.Fragment>
                  <button  className='d-table-cell ml-2 btn btn-success btn-sm ' onClick={()=> {setStep(Step.Ok)}}>
                     Помню
                  </button>
                  <button  className={'d-table-cell ml-2 btn btn-danger btn-sm mx-1'} onClick={()=> {setStep(Step.Failed)}}>
                     Забыто
                  </button>
                </React.Fragment>
      case Step.Ok:
         return <div className="text-success ml-2">{'\u2713'}</div>
      case Step.Failed:
         return <div className="text-danger ml-2">{'\u2717'}</div>
      default:
         return null;
   }
}


function ShowBothMode({rows, modeControls, isFirst, isKanaMode}) {
   isFirst = false;
   const rowElements = rows.map(
                  (item, index) => { 
                     const wordToShow = isKanaMode && item.length >= 3 ? item[2] : item[0];
                     if(index === 0) {
                        return (<tr key={index} >
                                    <td rowSpan={rows.length} >
                                      {modeControls}
                                    </td>
                                    <td className={isFirst ? "" : ""}>{wordToShow}</td>
                                    <td>{item[1]}</td>
                                    <td/>
                              </tr>)
                     } else {
                     return (<tr key={index}>
                                 <td>{wordToShow}</td>
                                 <td>{item[1]}</td>
                                 <td/>
                           </tr>)
                     }
                  });
   return rowElements;
}

function TestTranslationMode({rows, modeControls, isFirst, isKanaMode}) {
   const [isTranslationShown, showTranslation] = useState(false);

   const TranslationCell = ({translation}) => {
                              return (<td>{isTranslationShown
                                       ? (<div className="d-table-row">
                                             <div className="d-table-cell">{translation}</div> 
                                             <ConfirmTranslationControls />
                                          </div>)
                                       : '\u00A0'.repeat(/*translation.length*/10)}
                                 </td>)
                           };
   const buttonShow =  <button className={'btn btn-outline-info btn-sm mt-2 d-block '}
                                 onClick={()=> {showTranslation(true)}} 
                                 disabled={isTranslationShown}>
                              Показать перевод
                       </button>;
   const rowElements = rows.map(
                  (item, index) => { 
                     const wordToShow = isKanaMode && item.length >= 3 ? item[2] : item[0];
                     if(index === 0) {
                        return (<tr key={index}>
                                    <td rowSpan={rows.length}>{modeControls} {buttonShow}</td>
                                    <td>{wordToShow}</td>
                                    <TranslationCell translation={item[1]}/>
                              </tr>)
                     } else {
                        return (<tr key={index}>
                                  <td>{wordToShow}</td>
                                  <TranslationCell translation={item[1]}/>
                               </tr>);
                     }
                  });
   return rowElements;
}

function RowToInputWord({modeControls, rowSpan, word, translation, language}) {
   const [isCorrect, setCorrect] = useState(false);
   const onChangeText = (text) => {
      const correct = (text.length !== 0) && (word === text);
      setCorrect(correct);
   };
   const after = <div className='text-success float-right'>{isCorrect ? '\u2713' : ''}</div>;
   const editable = <div className="float-left">
                        <InputEditable 
                           ethalon={word} 
                           onChange={onChangeText}
                           language={language}
                        />
                    </div>;
   return  (<tr>
               {modeControls ? (<td rowSpan={rowSpan}>{modeControls}</td>) : ''}
               <td>
                  {editable}
                  {after}
               </td>
               <td className=''>{translation}</td>
            </tr>);
}

function TestWordMode({rows, modeControls, language, isKanaMode}) {
   const rowElements = rows.map(
         (item, index) => {
            const wordToShow = isKanaMode && item.length >= 3 ? item[2] : item[0];
            return <RowToInputWord word={wordToShow} 
                                 translation={item[1]} 
                                 language={language}
                                 modeControls={index === 0 ? modeControls : undefined}
                                 rowSpan={rows.length}
                                 key={index} />
         });
   return rowElements;
}

function Card({rows, language, name, isFirst, isActive, onActivate, isKanaMode}) {
   const [mode, setMode] = useState(Mode.TestTranslation);

   const ModeButton = ({buttonMode, name, title, id}) => {
             const style = isActive ? 'primary' : 'secondary';
             return <label className={`btn btn-sm btn-outline-${style} ` + ((mode === buttonMode)? 'active' : '')}
                        title={title}>
                        <input type="radio" name={"option"+id} id={"option"+id}
                        autoComplete="off" checked={mode === buttonMode}
                        onChange={() => { onActivate(); setMode(buttonMode) }} />
                        {name}
                   </label>
   };
   const modeControls = (
          <div className="btn-group-vertical btn-group-toggle p-0" data-toggle="buttons">
            <ModeButton buttonMode={Mode.ShowWordAndTranslation} name="Слово и перевод"   title='Показать слово и перевод' id="0"/>
            <ModeButton buttonMode={Mode.TestTranslation}        name="Проверить перевод" title='Проверить перевод' id="1"/>
            <ModeButton buttonMode={Mode.TestWord}               name="Ввести слово"      title='Проверит слово' id="2"/>
          </div>
   );
   let modeTable = null;
   const args = {
      rows: rows,
      modeControls: modeControls,
      isFirst: isFirst,
      language: language,
      isKanaMode: isKanaMode
   };
   switch(mode) {
      case Mode.ShowWordAndTranslation:  modeTable = <ShowBothMode         {...args}/>; break;
      case Mode.TestTranslation:         modeTable = <TestTranslationMode  {...args}/>; break;
      case Mode.TestWord:                modeTable = <TestWordMode         {...args}/>; break;
      default:
   }

   return (<tbody style={{ }} className={isActive ? "border border-primary" : ""}>{modeTable}</tbody>);
}

function InputTest() {
   return (
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
     </div>);
}

const KanaMode = ({onChange}) => (
    <div className="custom-control custom-checkbox mb-3">
      <input type="checkbox" className="custom-control-input" id="customCheck" name="kanaMode" onChange={(e) => onChange(e.target.checked)} />
      <label className="custom-control-label" htmlFor="customCheck">Отображать слова каной (理解 → りかい)</label>
    </div>
);

function Matrix(props) {
   const [deck, setDeck] = useState({rows:[], name: '', language: ''});
   const [activeCardId, setActiveCardId] = useState(undefined);
   const [isKanaMode, setKanaMode] = useState(false);
   
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

   let cards = [];
   for (let i=0, size = deck.rows.length; i < size; i += chunk_size) {
      const temparray = deck.rows.slice(i, i + chunk_size);
      const cardData = { 
                     rows: temparray, 
                     name : '' + (i + 1) + '-' + (i + temparray.length),
                     language : deck.language,
                     isFirst: i === 0,
                     isActive: activeCardId === i,
                     onActivate: () => setActiveCardId(i),
                     isKanaMode: isKanaMode
                   };
      cards.push(<Card key={i} {...cardData} />);
   }
   const tableStyle = "table table-striped  table-nonfluid border";
   return ( <div className="m-2">
               <h2 className="ml-3">{deck.name}</h2>
               { (['ja', 'cn' ].indexOf(deck.language)>= 0) ? <KanaMode onChange={(isSet) => setKanaMode(isSet)}/> : null }
               <InputTest />
               <table className={tableStyle}>
                  <thead className="thead-light">
                     <tr>
                        <th >Режим повторения</th> 
                        <th style={{ minWidth: '10em'}} >Слово</th> 
                        <th >Перевод</th> 
                     </tr>
                  </thead>
                  {cards}
               </table>
           </div>);
}

export { Matrix };