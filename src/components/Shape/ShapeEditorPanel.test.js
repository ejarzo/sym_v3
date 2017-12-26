import React from 'react';
import { shallow } from 'enzyme';
import ShapeEditorPanel from './ShapeEditorPanel';
 
it('renders "Shape Editor Panel"', () => {
  const wrapper = shallow(<ShapeEditorPanel/>);
  const textHeader = <p>Our Todo List</p>;
  expect(wrapper.contains(textHeader)).toEqual(true);
});