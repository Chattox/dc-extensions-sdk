import { ClientConnection, MC_EVENTS } from 'message-event-channel';
import { ERRORS_INIT } from './constants/Errors';
import { CONTEXT } from './constants/Events';
import { Extension } from './extensions/Extension';
import { extensionFactory } from './extensions/ExtensionFactory';

export interface InitOptions {
  window: Window;
  connectionTimeout: number | boolean;
  timeout: number | boolean;
  debug: boolean;
}

const defaultOptions: InitOptions = {
  window: window,
  connectionTimeout: false,
  timeout: false,
  debug: false,
};

// test

/**
 * The method that starts it all
 *
 * @type FieldType This is the field model that the extension is acting on
 * @type Params The installation parameters and instance parameters provided from Dynamic Content
 * @param options The configuration object to change the behaviour of the extension
 *
 * @return Returns a promise that will resolve with a new [[SDK]] instance         test
 *
 * ```typescript
 * import { init } from 'dc-extensions-sdk';
 *
 * async function initialize() {
 *  const contentFieldExtension = await <ContentFieldExtension>init();
 *
 *  //.. setup extension
 * }
 * ```
 */
export async function init<ExtensionType extends Extension<{}>>(
  options: Partial<InitOptions> = {}
): Promise<ExtensionType> {
  const mergedOptions: InitOptions = { ...defaultOptions, ...options };
  const connection = new ClientConnection(mergedOptions);
  return new Promise<ExtensionType>(async (resolve, reject) => {
    connection.init();
    connection.on(MC_EVENTS.CONNECTED, async () => {
      let context;
      try {
        context = await connection.request(CONTEXT.GET, null, { timeout: false });
      } catch (e) {
        reject(new Error(ERRORS_INIT.CONTEXT));
      }
      try {
        const extension: ExtensionType = extensionFactory(context, {
          connection,
          ...mergedOptions,
        });
        resolve(extension);
      } catch (e) {
        reject(e);
      }
    });
    connection.on(MC_EVENTS.CONNECTION_TIMEOUT, () => {
      reject(new Error(ERRORS_INIT.CONNECTION_TIMEOUT));
    });
  });
}
