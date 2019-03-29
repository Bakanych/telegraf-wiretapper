import { Player } from '../src/Player';
import { getMessage } from '../__test_helpers/TestHelper';
import { Synthesizer, Voice } from '../src/Synthesizer';
import { MessageProcessor } from '../src/MessageProcessor';
const mock_Synthesizer = jest.genMockFromModule<Synthesizer>('../src/Synthesizer');
const mock_MessageProcessor = jest.genMockFromModule<MessageProcessor>('../src/MessageProcessor');

const player = new Player(mock_Synthesizer, mock_MessageProcessor);

test(`${player.assignVoice.name} should assign voices cyclically`, () => {

  const voices = Object.values(Voice);
  const number_of_unique_users = voices.length + 1;
  const messages = [...Array(number_of_unique_users).keys()].map(x => getMessage(x));
  const result = player.assignVoice(messages);

  expect(result.get(number_of_unique_users - 1)).toEqual(voices[0]);
})