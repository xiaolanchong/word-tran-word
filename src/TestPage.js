import React from 'react';
import VirtualKeyboardInput from './VirtualKeyboardInput.js' 

const InputTest = () => {
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

const TestPage = (props) => {
   return <InputTest />;
}

export {TestPage};