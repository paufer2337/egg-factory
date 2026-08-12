import cartonBase from '../../assets/figma/carton-base.svg'
import cartonFrontRim from '../../assets/figma/carton-front-rim.svg'
import cartonFrontWall from '../../assets/figma/carton-front-wall.svg'
import cartonHinge from '../../assets/figma/carton-hinge.svg'
import cartonLidInner from '../../assets/figma/carton-lid-inner.svg'
import cartonLid from '../../assets/figma/carton-lid.svg'
import cartonRearRim from '../../assets/figma/carton-rear-rim.svg'
import cartonSeparators from '../../assets/figma/carton-separators.svg'
import cartonSideRims from '../../assets/figma/carton-side-rims.svg'
import cartonTray from '../../assets/figma/carton-tray.svg'
import egg from '../../assets/figma/egg.svg'
import eggAlt1 from '../../assets/figma/egg-alt-1.svg'
import eggAlt2 from '../../assets/figma/egg-alt-2.svg'
import type { TransferPhase } from '../../types'

type CartonProps = {
  occupancy: number
  phase: TransferPhase
}

const eggPositions = [
  ['19%', '51%'], ['40%', '49%'], ['61%', '51%'], ['78%', '48%'], ['29%', '62%'],
  ['51%', '60%'], ['70%', '62%'], ['16%', '70%'], ['43%', '70%'], ['67%', '70%'],
]
const eggAssets = [egg, eggAlt1, eggAlt2]

function FullLayer({ src, className = '' }: { src: string; className?: string }) {
  return <img className={`carton__layer ${className}`} src={src} width="360" height="190" alt="" />
}

export function Carton({ occupancy, phase }: CartonProps) {
  return (
    <div className={`carton carton--${phase}`}>
      <FullLayer src={cartonLid} className="carton__lid" />
      <FullLayer src={cartonLidInner} className="carton__lid" />
      <FullLayer src={cartonHinge} />
      <FullLayer src={cartonBase} />
      <FullLayer src={cartonTray} />
      <FullLayer src={cartonRearRim} />
      <FullLayer src={cartonSideRims} />
      <FullLayer src={cartonSeparators} />
      <div className="carton__eggs">
        {eggPositions.slice(0, Math.min(10, occupancy)).map(([left, top], index) => (
          <img
            src={eggAssets[index % eggAssets.length]}
            width={index % 3 === 0 ? 34 : index % 3 === 1 ? 36 : 38}
            height={index % 3 === 0 ? 52 : index % 3 === 1 ? 58 : 62}
            alt=""
            style={{ left, top }}
            key={index}
          />
        ))}
      </div>
      <FullLayer src={cartonFrontRim} />
      <FullLayer src={cartonFrontWall} />
    </div>
  )
}
