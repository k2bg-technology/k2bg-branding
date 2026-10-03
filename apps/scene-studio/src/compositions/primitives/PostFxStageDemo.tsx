import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { PostFxStage } from '../../primitives';

const TURNS_PER_SECOND = 0.15;
const TWO_PI = Math.PI * 2;

// An emissive knot for the bloom and depth-staggered spheres for the
// defocus; the spin derives from the frame so the demo stays deterministic.
export function PostFxStageDemo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const angle = (frame / fps) * TURNS_PER_SECOND * TWO_PI;

  return (
    <AbsoluteFill className="bg-base-black">
      <PostFxStage
        bloom={{ intensity: 0.9 }}
        depthOfField={{
          focusDistance: 0.005,
          focalLength: 0.02,
          bokehScale: 5,
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={40} />
        <mesh position={[0, 0.4, 0]} rotation={[0, angle, 0.4]}>
          <torusKnotGeometry args={[0.7, 0.22, 128, 32]} />
          <meshStandardMaterial
            color="#b8d200"
            emissive="#b8d200"
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[-1.1, -1.8, -3]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="#f8b500" />
        </mesh>
        <mesh position={[1.3, 2, -6]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </PostFxStage>
    </AbsoluteFill>
  );
}
