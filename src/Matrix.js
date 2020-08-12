import React, { useState, useEffect } from "react";
import { getUser, getTest } from './User.js';
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
   
function ConfirmTranslationControls({wordId}) {
   const Step = Object.freeze({
         ShowOkFailed: 1,
         Ok: 2,
         Failed: 3
      })
   const [step, setStep] = useState(Step.ShowOkFailed);
   switch(step) {
      case Step.ShowOkFailed:
         return <React.Fragment>
                  <span className="float-right">
                     <button className=' ml-2 btn btn-success btn-sm py-0' id={'remember-button-' + wordId}
                             onClick={()=> { setStep(Step.Ok); getTest().setTranslationTestResult(wordId, true); }} >
                        Помню
                     </button>
                     <button className=' ml-2 btn btn-danger btn-sm mx-1 py-0' id={'forgot-button-' + wordId}
                             onClick={()=> { setStep(Step.Failed); getTest().setTranslationTestResult(wordId, false); }} >
                        Не помню
                     </button>
                  </span>
                </React.Fragment>
      case Step.Ok:
         return <span className="text-success float-right ml-2">{'\u00A0'.repeat(7)  + '\u2713' + '\u00A0'.repeat(27)}</span>
      case Step.Failed:
         return <span className="text-danger float-right ml-2">{ '\u00A0'.repeat(25) + '\u2717' + '\u00A0'.repeat(9)}</span>
      default:
         return null;
   }
}

function getWordToShow(isKanaMode, item) {
   return isKanaMode && item.extra !== undefined ? item.extra : item.word;
}

function ShowBothMode({rows, modeControls, isFirst, isKanaMode}) {
   isFirst = false;
   const rowElements = rows.map(
                  (item, index) => {
                     const wordToShow = getWordToShow(isKanaMode, item);
                     if(index === 0) {
                        return (<tr key={index} >
                                    <td rowSpan={rows.length} >
                                      {modeControls}
                                    </td>
                                    <td className={isFirst ? "" : ""}>{wordToShow}</td>
                                    <td>{item.meaning}</td>
                               </tr>)
                     } else {
                     return (<tr key={index}>
                                 <td>{wordToShow}</td>
                                 <td>{item.meaning}</td>
                            </tr>)
                     }
                  });
   return rowElements;
}

function getBgColorFromScore(score) {
   switch(score) {
      // better 98c9a3  best  77bfa3
      case 3: return "#bfd8bd80";
      case 2: return "#dde7c780";
      case 1:
      case 0: return 0;

      case -1: return "#ffdab980";
      case -2: return "#fbc4ab80";
      case -3: 
      case -4: return "#f8ad9d80";
      default:
         return (score > 0) ? "#98c9a380" : "#f4978e80";
   }
}

function TestTranslationMode({rows, modeControls, isFirst, isKanaMode}) {
   const [isTranslationShown, showTranslation] = useState(false);

   const TranslationCell = ({translation, wordId}) => {
                              return (<td>{isTranslationShown
                                       ? (<>
                                             <span>{translation}</span> 
                                             <ConfirmTranslationControls key={wordId} wordId={wordId} />
                                          </>
                                          )
                                       : <span className='text-muted'>{'\u00A0'.repeat(/*translation.length/2*/5) + '?' + '\u00A0'.repeat(/*translation.length/2*/5)}</span>}
                                 </td>)
                           };
   const buttonShow =  <button className={'btn btn-outline-info btn-sm mt-2 d-block '}
                                 onClick={()=> {showTranslation(true)}} 
                                 disabled={isTranslationShown}>
                              Показать перевод
                       </button>;
   const rowElements = rows.map(
                  (item, index) => {
                     const bgColor = getBgColorFromScore(item.score);
                     const wordToShow = getWordToShow(isKanaMode, item);
                     if(index === 0) {
                        return (<tr key={index}>
                                    <td rowSpan={rows.length}>{modeControls} {buttonShow}</td>
                                    <td style={{ backgroundColor: bgColor}}>{wordToShow}</td>
                                    <TranslationCell translation={item.meaning} wordId={item.id} />
                              </tr>)
                     } else {
                        return (<tr key={index}>
                                  <td style={{backgroundColor: bgColor}}>{wordToShow}</td>
                                  <TranslationCell translation={item.meaning} wordId={item.id} />
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
               {modeControls ? (<td rowSpan={rowSpan}>{modeControls}</td>) : null}
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
            const wordToShow = getWordToShow(isKanaMode, item);
            return <RowToInputWord word={wordToShow} 
                                 translation={item.meaning} 
                                 language={language}
                                 modeControls={index === 0 ? modeControls : undefined}
                                 rowSpan={rows.length}
                                 key={index} />
         });
   return rowElements;
}

function Card({rows, language, name, isFirst, isActive, onActivate, isKanaMode,
               initialMode, onResetMode}) {
   const [mode, setMode] = useState(initialMode ?? Mode.TestTranslation);
   //console.log(initialMode ?? Mode.TestTranslation);
   if(initialMode !== undefined && initialMode !== mode) {
      setMode(initialMode);
   }

   const ModeButton = ({buttonMode, name, title, id}) => {
             const style = isActive ? 'primary' : 'secondary';
             return <label className={`btn btn-sm btn-outline-${style} text-left ` + ((mode === buttonMode)? 'active' : '')}
                        title={title}>
                        <input type="radio" name={"option"+id} id={"option"+id}
                        autoComplete="off" checked={mode === buttonMode}
                        onChange={() => { onActivate(); setMode(buttonMode) }} />
                        {name}
                   </label>
   };
   const modeControls = (
          <div className="btn-group-vertical btn-group-toggle p-0" data-toggle="buttons">
            <ModeButton buttonMode={Mode.ShowWordAndTranslation} name="1. Слово и перевод"   title='Показать слово и перевод' id="0"/>
            <ModeButton buttonMode={Mode.TestTranslation}        name="2. Проверить перевод" title='Проверить перевод' id="1"/>
            <ModeButton buttonMode={Mode.TestWord}               name="3. Ввести слово"      title='Проверит слово' id="2"/>
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



const KanaMode = ({onChange}) => (
    <div className="custom-control custom-checkbox mb-3">
      <input type="checkbox" className="custom-control-input" id="kanaModeCheck" name="kanaMode" onChange={(e) => onChange(e.target.checked)} />
      <label className="custom-control-label" htmlFor="kanaModeCheck">Отображать слова каной (理解 → りかい)</label>
    </div>
);

const VirtualKbd = ({onChange}) => (
    <div className="custom-control custom-checkbox mb-3">
      <input type="checkbox" className="custom-control-input" id="virtualKbdCheck" name="virtualKbd"
             onChange={(e) => onChange(e.target.checked)} defaultChecked={true} />
      <label className="custom-control-label" htmlFor="virtualKbdCheck">Виртуальная клавиатура</label>
    </div>
);

const OnlyForgotten = ({onChange}) => (
    <div className="custom-control custom-checkbox mb-3">
      <input type="checkbox" className="custom-control-input" id="onlyForgotteCheck" name="onlyForgotten"
             onChange={(e) => onChange(e.target.checked)} defaultChecked={false} />
      <label className="custom-control-label" htmlFor="onlyForgotteCheck">Показывать только забытые слова</label>
    </div>
);

// Create flag from country code
function getCountryFlag(cc) {
  // Mild sanity check.
  if (cc.length !== 2)
    return cc;

  // Convert char to Regional Indicator Symbol Letter
  function risl(chr) {
    return String.fromCodePoint(0x1F1E6 - 65 + chr.toUpperCase().charCodeAt(0));
  }

  // Create RISL sequence from country code.
  return risl(cc[0]) + risl(cc[1]);
}

const LanguageSelector = ({language}) => {
  return (<span>
            Язык: {getCountryFlag(language)}
          </span>)
}

const RadioButton = ({currentMode, myMode, text, onModeChange}) => {
  const active = currentMode === myMode
  return (
  <>
    <label class={`btn btn-secondary ${active ? 'active' : ''}`}>
      <input type="radio" name="options" id="option1" autocomplete="off"
              checkedAttr={currentMode === myMode}
              onChange={()=> onModeChange(myMode)}
      /> {text}
    </label>
  </>
  )
}

const SetAllCardMode = ({mode, onModeChange}) => {
  const args = {currentMode: mode, onModeChange: onModeChange}
   return (
      
      <div class="btn-group btn-group-toggle m-2" data-toggle="buttons">
        <label className="mr-2">Общий режим:</label>
        <RadioButton myMode={Mode.ShowWordAndTranslation}
                     text='Слово и перевод'
                    {...args} />
        <RadioButton myMode={Mode.TestTranslation}
                     text='Проверить перевод'
                    {...args} />
        <RadioButton myMode={Mode.TestWord}
                     text='Ввести слово'
                    {...args} />
      </div>
   )
}

const Page = (props) => 
  <>
    <div className='container-md'>
      <Matrix {...props} />
    </div>
  </>

const GlobalControls = ({deck, setInitialMode, initialMode, 
                         setKanaMode, setOnlyForgottenWords, }) => {
  const supportsExtraMode = [ 'ja', 'cn' ].includes(deck.language) // kana or pinyin
  return (
  <>
     <LanguageSelector language={deck.language} />
    { supportsExtraMode ? <KanaMode onChange={(isSet) => setKanaMode(isSet)}/> : null }
    { supportsExtraMode ? <VirtualKbd onChange={(isSet) => {} } /> : null } 
    <OnlyForgotten onChange={(isSet) => setOnlyForgottenWords(isSet)} />
    <SetAllCardMode mode={initialMode}
                   onModeChange={ (mode) => setInitialMode(mode) } />
  </>
  )
}

function Matrix(props) {
   const [deck, setDeck] = useState({rows:[], name: '', language: ''});
   const [activeCardId, setActiveCardId] = useState(undefined);
   const [isKanaMode, setKanaMode] = useState(false);
   const [isOnlyForgottenWords, setOnlyForgottenWords] = useState(false);
   const [initialMode, setInitialMode] = useState(Mode.TestTranslation);
   
   useEffect(() => {
      if(deck?.name === ''){
         deckGetter();
      }
   });
   
   const urlParams = queryString.parse(props.location.search);
   if (urlParams.id === undefined) {
      return null;
   }

   const deckId = urlParams.id;
   const deckGetter = async () => {
      const deckD = await getUser().getDeck(deckId, 0, 100)
      setDeck(deckD);
   }
   
   if (deck === undefined)
      return (<><h1 className='text-center'>Не такой колоды</h1></>)

   const chunk_size = 5
   console.log(deck)
   const cardRows = !isOnlyForgottenWords 
                        ? deck.rows 
                        : deck.rows.filter((item) => item.score < 0);

   let cards = [];
   for (let i=0, size = cardRows.length; i < size; i += chunk_size) {
      const temparray = cardRows.slice(i, i + chunk_size);
      const cardData = { 
                     rows: temparray, 
                     name : '' + (i + 1) + '-' + (i + temparray.length),
                     language : deck.language,
                     isFirst: i === 0,
                     isActive: activeCardId === i,
                     onActivate: () => { setActiveCardId(i); setInitialMode(undefined) },
                     isKanaMode: isKanaMode,
                     initialMode: initialMode,
                   };
      cards.push(<Card key={i} {...cardData} />);
   }

   const tableStyle = "table table-striped table-sm  table-nonfluid border";
   return ( <div className="m-2">
               <h2 className="ml-3">{deck.name}</h2>
               
               <div className="col-form-label" >{deck.description}</div>
               <GlobalControls deck={deck} initialMode={initialMode} setInitialMode={ setInitialMode }
                  setKanaMode={setKanaMode} setOnlyForgottenWords={setOnlyForgottenWords} />
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

export { Page as Matrix };