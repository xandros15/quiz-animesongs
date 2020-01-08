import { Howl, Howler } from 'howler'

export class Player {
  constructor () {
    this.howls = []
  }

  clear () {
    this.howls = []
  }

  load (src) {
    if (this.howls.length > 1) {
      this.howls.shift()
    }
    if (src) {
      this.howls.push(new Howl({
        src,
        autoplay: false,
        volume: 1,
        onloaderror: () => alert('Can\'t load next song.'),
      }))
    }
  }

  play () {
    this.howls[0] && this.howls[0].play()
  }

  changeVolume (value) {
    Howler.volume(value)
  }

  stop () {
    this.howls[0] && this.howls[0].stop()
  }
}
