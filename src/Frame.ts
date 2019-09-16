import { ClientConnection } from 'message.io';
import { FRAME } from './Events';
export class Frame {
  /**
   * Use in order to control the re-sizing of the Extension
   * @param connection message.io connection
   * @param win override the default window object
   */
  constructor(private connection: ClientConnection, private win: Window = window) {
    this.connection.on(FRAME.HEIGHT_GET, (_payload: any, resolve: Function, _reject: Function) => {
      resolve(this.getHeight());
    });
  }

  /**
   * Get the height of the Extension
   */
  public getHeight(): number {
    const body = this.win.document.querySelector('body');
    return body ? body.clientHeight : 0;
  }

  /**
   * Set the height of the frame to the height of the Extension. Can optionally override the measured height with a defined value.
   * @param height - should be used if you want to override the calculated height of your extension
   */
  public setHeight(height?: number) {
    if(height !== undefined && typeof height !== 'number') {
      throw new Error('setHeight() only accepts an optional number argument')
    }
    let h = height === undefined ? this.getHeight() : height;
    this.connection.emit(FRAME.HEIGHT_SET, h < 0 ? 0 : h);
  }

  /**
   * Start the auto-resizer
   */
  public startAutoResizer() {
    this.connection.emit(FRAME.AUTO_RESIZER_START);
  }
  /**
   * Stop the auto-resizer
   */
  public stopAutoResizer() {
    this.connection.emit(FRAME.AUTO_RESIZER_STOP);
  }
}
