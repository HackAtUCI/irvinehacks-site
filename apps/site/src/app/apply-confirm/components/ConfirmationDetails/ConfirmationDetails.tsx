import Button from "@/lib/components/Button/Button";
import styles from "./ConfirmationDetails.module.scss";

export default function ConfirmationDetails() {
	return (
		<div
			className={`${styles.details} w-8/12 flex flex-col items-center p-12 gap-10 z-1 max-[800px]:w-9/12 max-[400px]:w-11/12`}
		>
			<h2 className={`${styles.header} text-3xl`}>
				Please read our in-person policy for IrvineHacks
			</h2>
			<p className={`${styles.policy} text-lg`}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
				congue urna sit amet sem feugiat, eu varius enim faucibus. Proin
				consectetur erat id quam feugiat pretium. Lorem ipsum dolor sit
				amet, consectetur adipiscing elit. Fusce vitae diam orci.
				Suspendisse semper et tellus et faucibus. Nunc non turpis
				maximus, faucibus felis vel, mattis nulla. Integer dapibus elit
				sed felis tempus convallis. Fusce sit amet tellus a massa semper
				porta eget eu ligula. Integer ac urna nulla. Phasellus
				hendrerit, nisl elementum eleifend placerat, odio ex dignissim
				mauris, ultricies ultricies dui augue quis massa. Aenean
				suscipit facilisis quam, vel dignissim sapien congue ac. Ut ut
				mi vel nunc rutrum pellentesque quis eu dolor. Etiam nibh arcu,
				congue a pretium eget, faucibus vitae magna. Aenean pulvinar
				arcu orci. In tincidunt nibh sem. Morbi non mi enim.
				Pellentesque habitant morbi tristique senectus et netus et
				malesuada fames ac turpis egestas. Proin elementum lacinia
				mauris sit amet feugiat. Aenean cursus nibh ac ligula sodales,
				quis rutrum nisi ullamcorper. Integer arcu ante, efficitur ut
				elit a, auctor vehicula magna. Cras velit nulla, tempor vel leo
				a, volutpat ullamcorper lorem. Pellentesque habitant morbi
				tristique senectus et netus et malesuada fames ac turpis
				egestas. Quisque sed ipsum et nulla porta efficitur at sed
				augue. Sed pretium quis nisl a iaculis. Proin suscipit, nibh
				vitae cursus pulvinar, eros mi vehicula augue, non bibendum
				nulla urna eu libero. Pellentesque vitae ornare ex, sit amet
				porta libero. Phasellus nec nisi ac libero sollicitudin
				tristique at eu arcu. Etiam porta arcu quam, et venenatis metus
				fermentum at. Phasellus a felis eleifend, convallis massa vel,
				laoreet quam. Morbi magna erat, tristique non libero eu,
				interdum laoreet lectus. Suspendisse blandit neque quis quam
				posuere euismod. Phasellus rhoncus tristique iaculis. Maecenas
				venenatis vulputate massa in varius. Nullam eget consequat diam,
				vel sagittis nisi. Donec magna lectus, consectetur aliquet nisl
				non, feugiat venenatis dui. Nullam rhoncus blandit sem, sit amet
				finibus nibh pellentesque a. Nam dapibus a mi non ultrices. Cras
				volutpat tempor nibh at posuere. Sed a lacus egestas, egestas
				libero et, iaculis sapien. Ut nec cursus mi. Ut orci orci,
				tempor nec tellus at, consequat ullamcorper arcu. Duis
				scelerisque tempor lorem nec placerat. Quisque ut sem ante.
				Nulla et convallis dolor. Vestibulum ultricies sit amet ante nec
				scelerisque. Aenean in pulvinar arcu. Etiam pellentesque
				ultrices imperdiet. Fusce id vulputate nisi. Pellentesque
				habitant morbi tristique senectus et netus et malesuada fames ac
				turpis egestas. Quisque gravida dignissim tortor nec porta.
				Donec non nisl urna. Aliquam mollis vitae urna non dapibus.
				Aliquam in ligula ut metus pretium eleifend. Donec eu ante
				metus. Aliquam erat volutpat.
			</p>
			<p className="text-[#FF2222] text-2xl text-center">
				By clicking the button,{" "}
				<span className="font-bold">
					{'"'}Proceed to Application,{'"'}
				</span>{" "}
				you acknowledge that you have read and understood the in-person
				policy.
			</p>
			<Button text="Proceed to Application" href="/apply" />
		</div>
	);
}
