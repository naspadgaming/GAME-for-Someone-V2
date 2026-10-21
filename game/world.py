from game.chunk import Chunk
from ursina import distance


class ChunkManager:
    def __init__(self, chunk_size=16, render_radius=2):
        self.chunk_size = chunk_size
        self.render_radius = render_radius
        self.loaded = {}  # (cx,cz) -> Chunk

    def chunk_coords(self, x, z):
        cx = int(x) // self.chunk_size
        cz = int(z) // self.chunk_size
        return cx, cz

    def load_chunk(self, cx, cz):
        if (cx, cz) in self.loaded:
            return
        c = Chunk(cx, cz, size=self.chunk_size)
        c.generate()
        self.loaded[(cx, cz)] = c

    def unload_chunk(self, cx, cz):
        c = self.loaded.pop((cx, cz), None)
        if c:
            c.unload()

    def update(self, player_pos):
        px, py, pz = player_pos
        center = self.chunk_coords(px, pz)
        # load required chunks
        needed = set()
        for dx in range(-self.render_radius, self.render_radius+1):
            for dz in range(-self.render_radius, self.render_radius+1):
                needed.add((center[0]+dx, center[1]+dz))

        # load new
        for c in needed:
            if c not in self.loaded:
                self.load_chunk(*c)

        # unload far
        for c in list(self.loaded.keys()):
            if c not in needed:
                self.unload_chunk(*c)
