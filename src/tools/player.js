import { Howl, Howler } from 'howler'

export class Player {
  constructor () {
    this.howls = []
  }

  load (src) {
    this.howls.push(new Howl({
      src,
      autoplay: false,
      volume: 1,
      onloaderror: () => alert('Can\'t load next song.'),
    }))
    if (this.howls.length > 2) {
      this.howls.shift()
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
