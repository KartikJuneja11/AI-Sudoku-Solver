class Metrics:
    def __init__(self, algorithm_name):
        self.algorithm = algorithm_name
        self.time = 0.0
        self.nodes = 0
        self.backtracks = 0
        self.prunes = 0
        self.checks = 0
        self.assignments = 0
        self.extra = {}  # For algorithm-specific metrics
    
    def count_node(self):
        self.nodes += 1
    
    def count_backtrack(self):
        self.backtracks += 1
    
    def count_prune(self):
        self.prunes += 1
    
    def count_check(self):
        self.checks += 1
    
    def count_assignment(self):
        self.assignments += 1
    
    def set_time(self, time_in_seconds):
        self.time = time_in_seconds
    
    def add_extra(self, key, value):
        self.extra[key] = value
    
    def to_dict(self):
        result = {
            "algorithm": self.algorithm,
            "time": self.time,
            "nodes": self.nodes,
            "backtracks": self.backtracks,
            "prunes": self.prunes,
            "checks": self.checks,
            "assignments": self.assignments
        }
        result.update(self.extra)
        return result
