import { Howl, Howler } from 'howler'

const baseOptions = {
  autoplay: false,
  volume: 1,
  html5: true,
  onloaderror: () => alert('Can\'t load next song.')
}

export class Player {
  constructor () {
    this.howls = []
  }

  clear () {
    for (const howl of this.howls) {
      howl.unload()
    }
    this.howls = []
  }

  load (src, options = {}) {
    if (this.howls.length > 1) {
      this.howls[0].unload()
      this.howls.shift()
    }
    if (src) {
      this.howls.push(new Howl({
        ...options,
        ...baseOptions,
        src,
      }))
    }
  }

  loadOneNote (src, callback, options = {}) {
    if (this.howls.length > 1) {
      this.howls[0].unload()
      this.howls.shift()
    }
    if (src) {
      const howl = new Howl({
        ...options,
        ...baseOptions,
        html5: false,
        src,
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
