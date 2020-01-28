import { Howl, Howler } from 'howler'

export class Player {
  constructor () {
    this.howls = []
  }

  clear () {
    this.howls = []
  }

  load (src, options = {}) {
    if (this.howls.length > 1) {
      this.howls.shift()
    }
    if (src) {
      this.howls.push(new Howl({
        ...options,
        src,
        autoplay: false,
        volume: 1,
        onloaderror: () => alert('Can\'t load next song.'),
      }))
    }
  }

  loadOneNote (src, callback, options = {}) {
    if (this.howls.length > 1) {
      this.howls.shift()
    }
    if (src) {
      const howl = new Howl({
        ...options,
        src,
        autoplay: false,
        volume: 1,
        onloaderror: () => alert('Can\'t load next song.'),
      })

      howl.once('play', () => setTimeout(callback, 1500))
      this.howls.push(howl)
    }
  }

  play (callback) {
    if (!this.howls[0]) {
      return
    }
    if (callback) {
      this.howls[0].play().then(callback)
    } else {
      this.howls[0].play()
    }
  }

  changeVolume (value) {
    Howler.volume(value)
  }

  stop () {
    this.howls[0] && this.howls[0].stop()
  }
}
