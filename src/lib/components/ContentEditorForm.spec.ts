import { ClientConnection } from 'message-event-channel';
import { ContentEditorForm } from './ContentEditorForm';
import { CONTENT_EDITOR_FORM, FORM } from '../constants/Events';
import { FORM as ERRORS } from '../constants/Errors';

describe('ContentEditorForm', () => {
  let form: ContentEditorForm;
  let onSpy: jest.SpyInstance;
  let connection: ClientConnection;

  beforeEach(() => {
    connection = new ClientConnection();
    onSpy = jest.spyOn(connection, 'on');
    form = new ContentEditorForm(connection, true);
  });

  describe('ContentEditorForm.constructor', () => {
    it('should set up ContentEditorForm.READ_ONLY event', () => {
      expect(connection.on).toHaveBeenCalledWith(FORM.READ_ONLY, expect.any(Function));
    });

    it('should set up ContentEditorForm.CONTENT_EDITOR_MODEL_CHANGE event', () => {
      expect(connection.on).toHaveBeenCalledWith(
        CONTENT_EDITOR_FORM.CONTENT_EDITOR_MODEL_CHANGE,
        expect.any(Function)
      );
    });
  });
  describe('ContentEditorForm.onReadOnlyChange()', () => {
    it('should push callback to the onChangeStack, return an instance of the class and set readOnly value', () => {
      const cb = jest.fn();
      const $form = form.onReadOnlyChange(cb);
      const callOn = onSpy.mock.calls[0][1];
      callOn(false);
      expect($form).toBe(form);
      expect(cb).toHaveBeenCalledWith(false);
      expect(form.readOnly).toEqual(false);
    });
  });

  describe('ContentEditorForm.onModelChange()', () => {
    it('should push callback to the onModelChange, return an instance of the class', () => {
      const cb = jest.fn();
      const $form = form.onModelChange(cb);
      const callOn = onSpy.mock.calls[1][1];
      callOn({ content: { hello: 'world' }, errors: [] });
      expect($form).toBe(form);
      expect(cb).toHaveBeenCalledWith([], { hello: 'world' });
    });
  });

  describe('ContentEditorForm.isValid', () => {
    it('should return true if the form is valid', async () => {
      jest.spyOn(connection, 'request').mockReturnValue(Promise.resolve(true));

      expect(await form.isValid({ hello: 'world' })).toBeTruthy();
      expect(
        connection.request
      ).toHaveBeenCalledWith(CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_IS_VALID, { hello: 'world' });
    });
  });

  describe('ContentEditorForm.validate', () => {
    it('should return error report if the form is invalid', async () => {
      jest
        .spyOn(connection, 'request')
        .mockReturnValue(Promise.resolve([{ path: 'hello', message: 'hello is required' }]));

      expect(await form.validate({ hello: 'world' })).toEqual([
        { path: 'hello', message: 'hello is required' },
      ]);
      expect(
        connection.request
      ).toHaveBeenCalledWith(CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_VALIDATE, { hello: 'world' });
    });

    it('should return undefined if no errors found', async () => {
      jest.spyOn(connection, 'request').mockReturnValue(Promise.resolve([]));

      expect(await form.validate({ hello: 'world' })).toBeUndefined();
      expect(
        connection.request
      ).toHaveBeenCalledWith(CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_VALIDATE, { hello: 'world' });
    });
  });

  describe('ContentEditorForm.setValue', () => {
    it('should set the value of the form', async () => {
      jest.spyOn(connection, 'request').mockReturnValue(Promise.resolve([]));
      expect(await form.setValue({ hello: 'world' })).toEqual([]);
      expect(connection.request).toHaveBeenCalledWith(CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_SET, {
        hello: 'world',
      });
    });
  });

  describe('ContentEditorForm.getValue', () => {
    it('should get the value of the form', async () => {
      jest.spyOn(connection, 'request').mockReturnValue(Promise.resolve({ hello: 'world' }));
      expect(await form.getValue()).toEqual({ hello: 'world' });
      expect(connection.request).toHaveBeenCalledWith(CONTENT_EDITOR_FORM.CONTENT_EDITOR_FORM_GET);
    });

    it('should throw error if no model available', async () => {
      jest.spyOn(connection, 'request').mockReturnValue(Promise.reject(undefined));
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      expect(form.getValue()).rejects.toThrowError(ERRORS.NO_MODEL);
    });
  });
});
