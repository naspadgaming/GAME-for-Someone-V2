from ursina import Button, scene, mouse, destroy
from game.blocks import BLOCK_TYPES
from game import state


class Voxel(Button):
    def __init__(self, position=(0,0,0), btype=0):
        self.btype = int(btype)
        bt = BLOCK_TYPES[self.btype]
        super().__init__(
            parent=scene,
            position=position,
            model='cube',
            origin_y=0.5,
            texture='white_cube',
            color=bt['color'],
            scale=1
        )

    def input(self, key):
        if self.hovered:
            if key == 'left mouse down':
                destroy(self)
            if key == 'right mouse down':
                # place block of current selected type
                Voxel(position=self.position + mouse.normal, btype=state.current_block)
