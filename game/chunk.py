from game.voxel import Voxel
import math


class Chunk:
    def __init__(self, cx, cz, size=16):
        self.cx = cx
        self.cz = cz
        self.size = size
        self.entities = []

    def world_coords(self, x, z):
        return self.cx * self.size + x, self.cz * self.size + z

    def generate(self):
        # simple layered noise-like height using sin/cos for variation
        for x in range(self.size):
            for z in range(self.size):
                wx, wz = self.world_coords(x, z)
                # simple height function
                h = int((math.sin(wx * 0.1) + math.cos(wz * 0.1)) * 2 + 3)
                for y in range(-1, h):
                    # top layer = grass if y >= 0 else dirt
                    btype = 0 if y >= 0 else 1
                    v = Voxel(position=(wx, y, wz), btype=btype)
                    self.entities.append(v)

    def unload(self):
        for e in list(self.entities):
            try:
                e.disable()
                e.parent = None
            except Exception:
                pass
        self.entities.clear()
