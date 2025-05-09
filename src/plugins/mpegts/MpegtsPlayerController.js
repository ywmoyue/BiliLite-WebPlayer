import BasePlayerController from "../BasePlayerController";
class MpegtsPlayerController extends BasePlayerController {
  constructor(videoPlayer, audioPlayer, avSyncManager) {
    super(videoPlayer, audioPlayer, avSyncManager);
  }
}

export default MpegtsPlayerController;
